"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VoxideClient, VoxideWidget, type VoxideStatus } from "@voxide/react";
import { detectAskedLanguage, type LanguageCode } from "@hulum/shared";
import { getLanguage, getUserId, LANGUAGE_CHANGE_EVENT } from "@/lib/storage";
import { currentTheme, useTheme } from "@/lib/theme";
import { runTextAction } from "@/lib/text-actions";
import { publishVoxideClient } from "@/lib/voxide-client";
import { recognitionFailureMessage, TEXT_FALLBACK_HINT } from "@/lib/client-failures";
import {
  HULUM_VOICE_ROUTES,
  publishVoiceReply,
  readVoiceSession,
  voiceContextFor,
  writeVoiceSession,
  type VoiceSessionIds,
} from "@/lib/voice-session";
import {
  hulumTranscript,
  isAnswerableUtterance,
  isEchoOfReply,
  isStopCommand,
  isHulumSpeakPrompt,
  isSpokenHulumResult,
  isEmptyVoxideWsError,
  isVoxideRefusal,
  latestUserUtterance,
  readVoxidePublicKey,
  voxideSpeechLocale,
  VOXIDE_STARTERS,
  type VoxideTurn,
} from "@/lib/voxide";
import { isBrowserSpeaking, speakAloud, stopSpeaking } from "@/lib/speak";

export type VoxideSessionIds = VoiceSessionIds;

type Props = {
  session?: VoiceSessionIds;
  language?: LanguageCode;
  onSessionUpdate?: (next: VoiceSessionIds) => void;
  onReply?: (userText: string, reply: string) => void;
  onError?: (message: string) => void;
  onVoiceIssue?: (message: string) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function reportVoiceOpsEvent(
  code: "VOICE_RECOGNITION_FAILED" | "VOICE_SESSION_ERROR" | "VOICE_SILENCE_TIMEOUT",
  kind: "voice" | "session" = "voice",
): void {
  void fetch(`${API_URL}/api/ops/client-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, kind, name: "voxide.widget" }),
  }).catch(() => {
    /* Ops is best-effort. */
  });
}

function spokenText(args: Record<string, unknown>, fallback: string): string {
  const text = args.text;
  return typeof text === "string" && text.trim().length >= 2 ? text.trim() : fallback;
}

function eventText(payload: unknown): string {
  if (typeof payload === "string") {
    return payload.trim();
  }
  if (payload && typeof payload === "object") {
    const row = payload as { text?: unknown; message?: unknown };
    if (typeof row.text === "string") {
      return row.text.trim();
    }
    if (typeof row.message === "string") {
      return row.message.trim();
    }
  }
  return "";
}

function eventRole(payload: unknown): "user" | "ai" | undefined {
  if (payload && typeof payload === "object" && "role" in payload) {
    const role = (payload as { role: unknown }).role;
    if (role === "user" || role === "ai") {
      return role;
    }
  }
  return undefined;
}

type WidgetMessage = VoxideTurn;

function widgetMessages(client: VoxideClient): WidgetMessage[] {
  return (client.getSnapshot().messages ?? []).map((row) => ({
    role: row.role,
    text: row.text,
    ...(row.partial === true ? { partial: true } : {}),
  }));
}

function lastAnswerableUtterance(client: VoxideClient, fallback: string): string {
  const heard = latestUserUtterance(widgetMessages(client));
  if (!heard.streaming && isAnswerableUtterance(heard.text)) {
    return heard.text;
  }
  return isAnswerableUtterance(fallback) ? fallback : "";
}

/**
 * Pause after the last streamed word before answering.
 * Long enough that a short pause does not cut the question off at the first words.
 */
const SPEECH_SETTLE_MS = 1_600;

type AgentPlayback = {
  _voicePlayAudioChunk?: (data: string) => void;
  _voiceStopPlayback?: () => void;
};

/**
 * Drop the live model's own audio. That voice (often the higher, female one) adds its own
 * commentary on top of the browser voice that reads HULUM's answer.
 */
function muteAgentPlayback(client: VoxideClient): () => void {
  const raw = client as unknown as AgentPlayback;
  const stop = () => {
    try {
      raw._voiceStopPlayback?.call(client);
    } catch {
      /* Playback may already be closed. */
    }
  };
  raw._voicePlayAudioChunk = () => {
    stop();
  };
  stop();
  return () => {
    delete raw._voicePlayAudioChunk;
  };
}

type VoiceSnapshotWriter = (patch: { messages: WidgetMessage[] }) => void;

function voiceSnapshotWriter(client: VoxideClient): VoiceSnapshotWriter | null {
  const write = (client as unknown as { _setVoiceSnapshot?: VoiceSnapshotWriter })._setVoiceSnapshot;
  if (typeof write !== "function") {
    return null;
  }
  return write.bind(client);
}

/** Put the HULUM answer in the widget transcript. Do not send it back through the live model. */
function presentAssistantText(client: VoxideClient, text: string): void {
  const write = voiceSnapshotWriter(client);
  if (write === null) {
    return;
  }
  write({ messages: hulumTranscript(widgetMessages(client), text) });
}

function hideAgentChatter(client: VoxideClient): void {
  const write = voiceSnapshotWriter(client);
  if (write === null) {
    return;
  }
  const current = widgetMessages(client);
  const next = hulumTranscript(current);
  if (next.length === current.length && next.every((row, index) => row.text === current[index]?.text)) {
    return;
  }
  write({ messages: next });
}

/**
 * Site-wide Voxide widget (after login). Named capabilities match website actions.
 * Tools call the same runTextAction path as typed Ask HULUM.
 */
export function VoxideAskHulum({
  session,
  language,
  onSessionUpdate,
  onReply,
  onError,
  onVoiceIssue,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const theme = useTheme();
  const sessionRef = useRef<VoiceSessionIds>(session ?? readVoiceSession());
  if (session) {
    sessionRef.current = { ...readVoiceSession(), ...session };
  }
  const languageRef = useRef<LanguageCode>(language ?? getLanguage());
  languageRef.current = language ?? getLanguage();
  const onSessionUpdateRef = useRef(onSessionUpdate);
  onSessionUpdateRef.current = onSessionUpdate;
  const onReplyRef = useRef(onReply);
  onReplyRef.current = onReply;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onVoiceIssueRef = useRef(onVoiceIssue);
  onVoiceIssueRef.current = onVoiceIssue;
  const lastUserRef = useRef("");
  const lastReplyRef = useRef("");
  const recoveringRef = useRef(false);
  const spokeForRef = useRef("");
  const publicKey = readVoxidePublicKey();
  const [askedLanguage, setAskedLanguage] = useState<LanguageCode>(
    () => language ?? getLanguage(),
  );
  const speechLocale = voxideSpeechLocale(askedLanguage);
  const speechLocaleRef = useRef(speechLocale);
  speechLocaleRef.current = speechLocale;

  useEffect(() => {
    const sync = () => setAskedLanguage(language ?? getLanguage());
    sync();
    window.addEventListener(LANGUAGE_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [language]);

  const persistSession = (next: VoiceSessionIds) => {
    writeVoiceSession(next);
    sessionRef.current = { ...readVoiceSession(), ...next };
    onSessionUpdateRef.current?.(next);
  };

  const callHulumAction = async (utterance: string): Promise<string> => {
    const userId = getUserId();
    if (!userId) {
      const needProfile = "Create a profile first so HULUM knows who you are.";
      onErrorRef.current?.(needProfile);
      return needProfile;
    }
    const current = voiceContextFor(pathnameRef.current, {
      ...readVoiceSession(),
      ...sessionRef.current,
    });
    const asked = detectAskedLanguage(utterance, languageRef.current);
    const response = await runTextAction({
      userId,
      text: utterance,
      opportunityId: current.opportunityId,
      analysisId: current.analysisId,
      language: asked,
    });
    persistSession({
      opportunityId: response.opportunityId,
      analysisId: response.analysisId,
    });
    lastReplyRef.current = response.reply;
    onReplyRef.current?.(utterance, response.reply);
    publishVoiceReply(utterance, response.reply, response);
    return response.reply;
  };

  const runOrFail = async (utterance: string): Promise<string> => {
    try {
      return await callHulumAction(utterance);
    } catch (error) {
      const message = error instanceof Error ? error.message : "HULUM action failed.";
      onErrorRef.current?.(message);
      return message;
    }
  };

  const goTo = (path: string, spoken: string) => {
    router.push(path);
    return spoken;
  };

  const client = useMemo(() => {
    if (publicKey === "") {
      return null;
    }

    const ai = new VoxideClient({
      publicKey,
      language: speechLocale,
      ui: {
        title: "Ask HULUM",
        theme: currentTheme(),
        position: "bottom-right",
        launcherShape: "circle",
        launcherMode: "panel",
        launcherIcon: "mic",
        greeting:
          "I can open any HULUM page and run the same actions as the website. Say show me scholarships, then analyze for me.",
        placeholder: "Show me scholarships",
        starters: VOXIDE_STARTERS,
      },
    });

    ai.setActiveRoute(pathname);
    ai.enableNavigation(router, HULUM_VOICE_ROUTES);

    const userId = getUserId();
    if (userId) {
      ai.setUser({ userId });
    }

    ai.setFallback({
      message:
        "Call showScholarships, showInternships, showOpportunities, analyzeOpportunity, or askHulum. Never say you lack tools. Speak only the handler return value.",
      suggestions: VOXIDE_STARTERS,
    });

    ai.register({
      showScholarships: {
        description:
          "Required for any request to show, list, find, or display scholarships (including 'show me scholarship'). Call this tool. Return and speak only the handler text. Never say you lack tools.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "show me scholarships")),
      },
      showInternships: {
        description: "List stored internships. Speak the returned text.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "show me internships")),
      },
      showFellowships: {
        description: "List stored fellowships. Speak the returned text.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "show me fellowships")),
      },
      showOpportunities: {
        description: "List stored opportunities. Speak the returned text.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "show me opportunities")),
      },
      analyzeOpportunity: {
        description:
          "Analyze the current or first matching opportunity against the signed-in profile. Use for analyze, analysis, analysis for me, should I apply. Speak the full returned result. Do not apologize.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) =>
          runOrFail(
            spokenText(
              args,
              lastUserRef.current || "analyze this opportunity based on my profile",
            ),
          ),
      },
      tellDetails: {
        description: "Read stored details of the current opportunity.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "tell me the details")),
      },
      explainDecision: {
        description: "Explain the stored APPLY, MAYBE, or SKIP. Do not change the decision.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "why did you say that?")),
      },
      showMissingRequirements: {
        description: "List missing or uncertain requirements from the stored analysis.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "what am I missing?")),
      },
      showReadiness: {
        description: "List the stored readiness checklist.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "what should I prepare?")),
      },
      showProfileGaps: {
        description: "List missing fields on the signed-in profile. Voice does not save profile facts.",
        params: { text: { type: "string" } },
        scope: "global",
        handler: async (args) => runOrFail(spokenText(args, "what is missing from my profile?")),
      },
      openJourney: {
        description: "Open the HULUM Journey page.",
        scope: "global",
        handler: async () => goTo("/journey", "Opening Journey."),
      },
      openOpportunities: {
        description: "Open the stored opportunities list.",
        scope: "global",
        handler: async () => goTo("/opportunities", "Opening Opportunities."),
      },
      openProfile: {
        description: "Open the profile page so the user can edit facts.",
        scope: "global",
        handler: async () => goTo("/profile", "Opening Profile. Voice cannot silently change stored facts."),
      },
      openAskHulum: {
        description: "Open Ask HULUM for typed questions and quick actions.",
        scope: "global",
        handler: async () => goTo("/assistant", "Opening Ask HULUM."),
      },
      openScreenshot: {
        description: "Open the screenshot analysis page.",
        scope: "global",
        handler: async () => goTo("/screenshot", "Opening Screenshot analysis."),
      },
      openResearch: {
        description: "Open ScholarXIV research. This is papers, not scholarship listings.",
        scope: "global",
        handler: async () => goTo("/research", "Opening Research. These are papers, not scholarship listings."),
      },
      askHulum: {
        description:
          "Call this for any HULUM question when another tool does not fit: list opportunities, analyze, details, APPLY MAYBE SKIP, or profile gaps. Pass the user's exact words. Speak only the returned text. Never say you lack tools.",
        params: {
          text: {
            type: "string",
            required: true,
            description: "The user's exact spoken or typed words.",
          },
        },
        scope: "global",
        handler: async (args) => {
          const utterance = spokenText(args, lastUserRef.current);
          if (utterance.length < 2) {
            onVoiceIssueRef.current?.("No clear speech heard. Try again, or type a request.");
            return "Say show me scholarships, then analyze for me.";
          }
          return runOrFail(utterance);
        },
      },
    });

    ai.bindState(() => {
      const context = voiceContextFor(pathnameRef.current, sessionRef.current);
      return {
        page: pathnameRef.current,
        opportunityId: context.opportunityId ?? null,
        analysisId: context.analysisId ?? null,
        language: languageRef.current,
        canAnalyze: true,
        canListScholarships: true,
      };
    });

    return ai;
  }, [publicKey, router]);

  useEffect(() => {
    if (client === null) return;
    client.setLanguage(speechLocale);
    client.setActiveRoute(pathname);
  }, [client, pathname, speechLocale]);

  useEffect(() => {
    if (client === null) {
      return;
    }

    publishVoxideClient(client);
    const releaseMute = muteAgentPlayback(client);
    void client.init().catch(() => {
      /* VoiceButton surfaces connect failures after init. */
    });
    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    let lastStatus: VoxideStatus | null = null;

    const clearSilence = () => {
      if (silenceTimer !== undefined) {
        clearTimeout(silenceTimer);
        silenceTimer = undefined;
      }
    };

    const isLoopText = (text: string) =>
      isVoxideRefusal(text) ||
      isHulumSpeakPrompt(text) ||
      isSpokenHulumResult(text) ||
      isEchoOfReply(text, lastReplyRef.current);

    const rememberUser = (text: string) => {
      if (isAnswerableUtterance(text) && !isLoopText(text)) {
        lastUserRef.current = text;
      }
    };

    let heardSpeech = false;
    /** Ignore the microphone while an answer is being read, plus a short tail so the mic does not hear itself. */
    let ignoreMicUntil = 0;
    const micLocked = () => Date.now() < ignoreMicUntil || isBrowserSpeaking();

    const speakHulumReply = (utterance: string) => {
      const value = utterance.trim();
      if (
        recoveringRef.current ||
        spokeForRef.current === value ||
        !isAnswerableUtterance(value) ||
        isLoopText(value)
      ) {
        return;
      }
      const spoken = heardSpeech;
      heardSpeech = false;
      recoveringRef.current = true;
      lastUserRef.current = value;
      // Stop Voxide playback only. disconnect() closes the live socket and the SDK
      // logs `[Voxide WS] Error: {}` (empty Event) — Next.js shows that as an overlay.
      client.interrupt();
      void runOrFail(value)
        .then((reply) => {
          if (reply.trim() === "" || isVoxideRefusal(reply)) {
            return;
          }
          spokeForRef.current = value;
          lastReplyRef.current = reply;
          client.interrupt();
          presentAssistantText(client, reply);
          if (spoken) {
            ignoreMicUntil = Date.now() + 120_000;
            const started = speakAloud(reply, speechLocaleRef.current, () => {
              ignoreMicUntil = Date.now() + 1_200;
            });
            if (!started) {
              ignoreMicUntil = 0;
            }
          }
        })
        .finally(() => {
          recoveringRef.current = false;
        });
    };

    const recoverIfRefused = (aiText: string) => {
      if (!isVoxideRefusal(aiText)) {
        return;
      }
      if (lastReplyRef.current.trim() !== "") {
        presentAssistantText(client, lastReplyRef.current);
        return;
      }
      const lastUser = lastAnswerableUtterance(client, lastUserRef.current);
      if (!isAnswerableUtterance(lastUser) || isLoopText(lastUser)) {
        return;
      }
      speakHulumReply(lastUser);
    };

    let lastDispatchedUser = "";
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let settleText = "";
    let applyingTranscript = false;
    let agentCut = false;
    const dispatchUser = (text: string) => {
      if (isStopCommand(text)) {
        stopSpeaking();
        client.interrupt();
        ignoreMicUntil = Date.now() + 1_200;
        return;
      }
      if (
        micLocked() ||
        text === "" ||
        text === lastDispatchedUser ||
        !isAnswerableUtterance(text) ||
        isLoopText(text)
      ) {
        return;
      }
      lastDispatchedUser = text;
      rememberUser(text);
      speakHulumReply(text);
    };
    const showHulumOnly = (heardText: string) => {
      if (applyingTranscript || !isAnswerableUtterance(heardText)) {
        return;
      }
      applyingTranscript = true;
      if (spokeForRef.current === heardText && lastReplyRef.current.trim() !== "") {
        presentAssistantText(client, lastReplyRef.current);
      } else {
        hideAgentChatter(client);
      }
      applyingTranscript = false;
    };
    const unsubSnap = client.subscribe(() => {
      if (applyingTranscript) {
        return;
      }
      const messages = widgetMessages(client);
      const heard = latestUserUtterance(messages);
      if (isStopCommand(heard.text)) {
        stopSpeaking();
        client.interrupt();
        ignoreMicUntil = Date.now() + 1_200;
        return;
      }
      if (micLocked() || isLoopText(heard.text)) {
        return;
      }
      if (heard.streaming) {
        heardSpeech = true;
        if (heard.text !== settleText) {
          settleText = heard.text;
          agentCut = false;
          stopSpeaking();
          if (settleTimer !== undefined) {
            clearTimeout(settleTimer);
          }
          const pending = heard.text;
          settleTimer = setTimeout(() => {
            settleTimer = undefined;
            dispatchUser(pending);
          }, SPEECH_SETTLE_MS);
        }
      } else if (heard.text !== "") {
        if (settleTimer !== undefined) {
          clearTimeout(settleTimer);
          settleTimer = undefined;
        }
        settleText = "";
        dispatchUser(heard.text);
      }
      showHulumOnly(heard.text);
      const refusal = [...messages].reverse().find((row) => row.role === "ai" && isVoxideRefusal(row.text));
      if (refusal !== undefined) {
        recoverIfRefused(refusal.text);
      }
    });

    const unsubError = client.on("error", (payload: unknown) => {
      if (isEmptyVoxideWsError(payload)) {
        return;
      }
      clearSilence();
      reportVoiceOpsEvent("VOICE_RECOGNITION_FAILED", "voice");
      const detail =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : typeof payload === "string"
            ? payload
            : "";
      onVoiceIssueRef.current?.(recognitionFailureMessage(detail || undefined));
    });

    const unsubTranscript = client.on("transcript", (payload: unknown) => {
      const text = eventText(payload);
      if (!isLoopText(text)) {
        rememberUser(text);
      }
    });

    const unsubMessage = client.on("message", (payload: unknown) => {
      const text = eventText(payload);
      const role = eventRole(payload);
      if (isLoopText(text)) {
        if (role === "ai" || role === undefined) {
          recoverIfRefused(text);
        }
        return;
      }
      if (role === "user") {
        dispatchUser(text);
        return;
      }
      if (role === "ai") {
        recoverIfRefused(text);
        return;
      }
      rememberUser(text);
    });

    const unsubStatus = client.on("status", (status: VoxideStatus) => {
      lastStatus = status;
      clearSilence();
      if (status === "speaking") {
        if (!agentCut) {
          agentCut = true;
          client.interrupt();
        }
        return;
      }
      if (status === "error") {
        reportVoiceOpsEvent("VOICE_SESSION_ERROR", "session");
        onVoiceIssueRef.current?.(`Voice session error. ${TEXT_FALLBACK_HINT}`);
        return;
      }
      if (status === "listening") {
        silenceTimer = setTimeout(() => {
          if (lastStatus === "listening" && !recoveringRef.current) {
            reportVoiceOpsEvent("VOICE_SILENCE_TIMEOUT", "voice");
            onVoiceIssueRef.current?.(
              `No speech detected for a while (silence/timeout). ${TEXT_FALLBACK_HINT}`,
            );
          }
        }, 12_000);
      }
    });

    return () => {
      clearSilence();
      if (settleTimer !== undefined) {
        clearTimeout(settleTimer);
      }
      stopSpeaking();
      releaseMute();
      unsubSnap();
      unsubError();
      unsubTranscript();
      unsubMessage();
      unsubStatus();
      publishVoxideClient(null);
      client.destroy();
    };
  }, [client]);

  // Ask HULUM has its own mic on this same client; the floating launcher would cover its input.
  if (client === null || pathname === "/assistant") {
    return null;
  }

  return <VoxideWidget client={client} theme={theme} title="Ask HULUM" position="bottom-right" />;
}

export { hasVoxidePublicKey } from "@/lib/voxide";
