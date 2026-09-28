"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VoxideClient, VoxideWidget, type VoxideStatus } from "@voxide/react";
import { detectAskedLanguage, type LanguageCode } from "@hulum/shared";
import { getLanguage, getUserId } from "@/lib/storage";
import { currentTheme, useTheme } from "@/lib/theme";
import { runTextAction } from "@/lib/text-actions";
import { publishVoxideClient } from "@/lib/voxide-client";
import { recognitionFailureMessage, TEXT_FALLBACK_HINT } from "@/lib/client-failures";
import {
  HULUM_VOICE_ROUTES,
  publishVoiceReply,
  readVoiceSession,
  writeVoiceSession,
  type VoiceSessionIds,
} from "@/lib/voice-session";
import {
  isEchoOfReply,
  isHulumProductRequest,
  isSpokenHulumResult,
  isVoxideRefusal,
  readVoxidePublicKey,
  voxideSpeakOnly,
  VOXIDE_STARTERS,
} from "@/lib/voxide";

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
    const current = { ...readVoiceSession(), ...sessionRef.current };
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
      language: "en-US",
      ui: {
        title: "Ask HULUM",
        theme: currentTheme(),
        position: "bottom-right",
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
        "Always call a registered HULUM tool. Never say you lack ability. Show scholarships, internships, or other stored opportunities; analyze against the profile; or open a page.",
      suggestions: VOXIDE_STARTERS,
    });

    ai.register({
      showScholarships: {
        description:
          "Always call this when the user asks to show, list, or find scholarships. Speak only the returned text. Never say you lack ability.",
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
          "Any other website action: list, analyze, details, APPLY MAYBE SKIP filter, or profile gaps. Pass the user's exact words. Speak the returned text.",
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

    ai.bindState(() => ({
      page: pathname,
      opportunityId: sessionRef.current.opportunityId ?? null,
      analysisId: sessionRef.current.analysisId ?? null,
      language: languageRef.current,
      canAnalyze: true,
      canListScholarships: true,
    }));

    return ai;
  }, [publicKey, router]);

  useEffect(() => {
    if (client === null) return;
    client.setLanguage("en-US");
    client.setActiveRoute(pathname);
  }, [client, pathname]);

  useEffect(() => {
    if (client === null) {
      return;
    }

    publishVoxideClient(client);
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
      isSpokenHulumResult(text) ||
      isEchoOfReply(text, lastReplyRef.current);

    const rememberUser = (text: string) => {
      if (text.length >= 4 && isHulumProductRequest(text) && !isLoopText(text)) {
        lastUserRef.current = text;
      }
    };

    const speakHulumReply = (utterance: string) => {
      if (
        recoveringRef.current ||
        spokeForRef.current === utterance ||
        !isHulumProductRequest(utterance) ||
        isLoopText(utterance)
      ) {
        return;
      }
      recoveringRef.current = true;
      lastUserRef.current = utterance;
      client.interrupt();
      void runOrFail(utterance)
        .then((reply) => {
          if (reply.trim() === "" || isVoxideRefusal(reply)) {
            return;
          }
          if (spokeForRef.current === utterance) {
            return;
          }
          spokeForRef.current = utterance;
          lastReplyRef.current = reply;
          client.interrupt();
          return client.sendText(voxideSpeakOnly(reply));
        })
        .finally(() => {
          recoveringRef.current = false;
        });
    };

    const recoverIfRefused = (aiText: string) => {
      const lastUser = lastUserRef.current;
      if (!isVoxideRefusal(aiText) || !isHulumProductRequest(lastUser) || isLoopText(lastUser)) {
        return;
      }
      speakHulumReply(lastUser);
    };

    const unsubError = client.on("error", (payload: unknown) => {
      clearSilence();
      reportVoiceOpsEvent("VOICE_RECOGNITION_FAILED", "voice");
      const detail =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
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
        rememberUser(text);
        speakHulumReply(text);
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
      if (status === "error") {
        reportVoiceOpsEvent("VOICE_SESSION_ERROR", "session");
        onVoiceIssueRef.current?.(`Voice session error. ${TEXT_FALLBACK_HINT}`);
        return;
      }
      if (status === "listening") {
        silenceTimer = setTimeout(() => {
          if (lastStatus === "listening") {
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
      unsubError();
      unsubTranscript();
      unsubMessage();
      unsubStatus();
      publishVoxideClient(null);
      client.destroy();
    };
  }, [client]);

  if (client === null) {
    return null;
  }

  return <VoxideWidget client={client} theme={theme} title="Ask HULUM" position="bottom-right" />;
}

export { hasVoxidePublicKey } from "@/lib/voxide";
