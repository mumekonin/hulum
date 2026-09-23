"use client";

import { useEffect, useMemo, useRef } from "react";
import { VoxideClient, VoxideWidget, type VoxideStatus } from "@voxide/react";
import { getUserId } from "@/lib/storage";
import { runTextAction } from "@/lib/text-actions";

export type VoxideSessionIds = {
  opportunityId?: string;
  analysisId?: string;
};

type Props = {
  /** Latest Ask HULUM session ids — read via refs so tools never go stale. */
  session: VoxideSessionIds;
  onSessionUpdate: (next: { opportunityId?: string; analysisId?: string }) => void;
  onReply: (userText: string, reply: string) => void;
  onError: (message: string) => void;
  /** Mic / recognition / silence recovery — keep text + quick actions usable. */
  onVoiceIssue?: (message: string) => void;
};

const TEXT_FALLBACK_HINT =
  "Voice had trouble. Type a request or use a quick action — those call the same HULUM APIs.";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Codes only — never send utterance text to ops. */
function reportVoiceOpsEvent(
  code: "VOICE_RECOGNITION_FAILED" | "VOICE_SESSION_ERROR" | "VOICE_SILENCE_TIMEOUT",
  kind: "voice" | "session" = "voice",
): void {
  void fetch(`${API_URL}/api/ops/client-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, kind, name: "voxide.widget" }),
  }).catch(() => {
    /* Ops is best-effort; never block the Ask HULUM UI. */
  });
}

/**
 * Official Voxide React widget (voxide.app/docs / @voxide/react README).
 * Tools call the same runTextAction path as typed Ask HULUM — never invent APPLY/MAYBE/SKIP.
 */
export function VoxideAskHulum({
  session,
  onSessionUpdate,
  onReply,
  onError,
  onVoiceIssue,
}: Props) {
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const onSessionUpdateRef = useRef(onSessionUpdate);
  onSessionUpdateRef.current = onSessionUpdate;
  const onReplyRef = useRef(onReply);
  onReplyRef.current = onReply;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onVoiceIssueRef = useRef(onVoiceIssue);
  onVoiceIssueRef.current = onVoiceIssue;

  const publicKey = process.env.NEXT_PUBLIC_VOXIDE_KEY?.trim() ?? "";

  const client = useMemo(() => {
    if (!publicKey.startsWith("vox_pub_")) {
      return null;
    }

    const ai = new VoxideClient({
      publicKey,
      language: "en-US",
      ui: {
        title: "Ask HULUM",
        theme: "light",
        position: "bottom-right",
      },
    });

    ai.setFallback({
      message:
        "That was not a HULUM product action. Try Show me internships, Should I apply for this?, Why?, What am I missing?, or What should I prepare? Or type below.",
      suggestions: [
        "Show me internships",
        "Should I apply for this?",
        "Why did you say that?",
        "What am I missing?",
        "What should I prepare?",
      ],
    });

    ai.register({
      runHulumAction: {
        description:
          "Run a HULUM product action from the user's spoken or typed request. Use for listing or filtering stored opportunities, analyzing the selected opportunity, explaining a stored APPLY/MAYBE/SKIP decision, showing missing requirements, or showing the readiness checklist. Never invent APPLY, MAYBE, or SKIP — only report what HULUM returns. Never invent opportunity listings.",
        params: {
          text: {
            type: "string",
            required: true,
            description:
              "The user's request in English, e.g. Show me internships, Should I apply for this?, Why did you say that?, What am I missing?, What should I prepare?",
          },
        },
        scope: "global",
        handler: async ({ text }) => {
          const utterance = typeof text === "string" ? text.trim() : "";
          if (utterance.length < 2) {
            onVoiceIssueRef.current?.(
              "No clear speech heard. Try again, or type a request / use a quick action.",
            );
            return {
              ok: false,
              reply: "Say a HULUM request such as Show me internships or Should I apply for this?",
            };
          }

          const userId = getUserId();
          if (!userId) {
            onErrorRef.current("Create a profile first so HULUM knows who you are.");
            return { ok: false, reply: "Create a profile first so HULUM knows who you are." };
          }

          try {
            const current = sessionRef.current;
            const response = await runTextAction({
              userId,
              text: utterance,
              opportunityId: current.opportunityId,
              analysisId: current.analysisId,
            });
            onSessionUpdateRef.current({
              opportunityId: response.opportunityId,
              analysisId: response.analysisId,
            });
            onReplyRef.current(utterance, response.reply);
            return {
              ok: true,
              reply: response.reply,
              opportunityId: response.opportunityId ?? null,
              analysisId: response.analysisId ?? null,
              notice:
                "APPLY / MAYBE / SKIP come only from HULUM decide() on the server. Do not invent a decision.",
            };
          } catch (error) {
            const message = error instanceof Error ? error.message : "HULUM action failed.";
            onErrorRef.current(message);
            return { ok: false, reply: message };
          }
        },
      },
    });

    ai.bindState(() => ({
      page: "/assistant",
      opportunityId: sessionRef.current.opportunityId ?? null,
      analysisId: sessionRef.current.analysisId ?? null,
      language: "en",
      rule: "Never invent APPLY, MAYBE, SKIP, or opportunity listings. Call runHulumAction.",
    }));

    return ai;
  }, [publicKey]);

  useEffect(() => {
    if (client === null) {
      return;
    }

    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    let lastStatus: VoxideStatus | null = null;

    const clearSilence = () => {
      if (silenceTimer !== undefined) {
        clearTimeout(silenceTimer);
        silenceTimer = undefined;
      }
    };

    const unsubError = client.on("error", (payload: unknown) => {
      clearSilence();
      reportVoiceOpsEvent("VOICE_RECOGNITION_FAILED", "voice");
      const detail =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : "";
      onVoiceIssueRef.current?.(
        detail
          ? `Voice error: ${detail}. ${TEXT_FALLBACK_HINT}`
          : `Recognition or connection failed. ${TEXT_FALLBACK_HINT}`,
      );
    });

    const unsubStatus = client.on("status", (status: VoxideStatus) => {
      lastStatus = status;
      clearSilence();
      if (status === "error") {
        reportVoiceOpsEvent("VOICE_SESSION_ERROR", "session");
        onVoiceIssueRef.current?.(`Voice session error. ${TEXT_FALLBACK_HINT}`);
        return;
      }
      // If we stay in listening with no follow-up activity, nudge toward text.
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
      unsubStatus();
    };
  }, [client]);

  if (client === null) {
    return null;
  }

  return <VoxideWidget client={client} theme="light" title="Ask HULUM" position="bottom-right" />;
}

export function hasVoxidePublicKey(): boolean {
  const key = process.env.NEXT_PUBLIC_VOXIDE_KEY?.trim() ?? "";
  return key.startsWith("vox_pub_");
}
