"use client";

import { useMemo, useRef } from "react";
import { VoxideClient, VoxideWidget } from "@voxide/react";
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
};

/**
 * Official Voxide React widget (voxide.app/docs / @voxide/react README).
 * Tools call the same runTextAction path as typed Ask HULUM — never invent APPLY/MAYBE/SKIP.
 */
export function VoxideAskHulum({ session, onSessionUpdate, onReply, onError }: Props) {
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const onSessionUpdateRef = useRef(onSessionUpdate);
  onSessionUpdateRef.current = onSessionUpdate;
  const onReplyRef = useRef(onReply);
  onReplyRef.current = onReply;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

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

  if (client === null) {
    return null;
  }

  return <VoxideWidget client={client} theme="light" title="Ask HULUM" position="bottom-right" />;
}

export function hasVoxidePublicKey(): boolean {
  const key = process.env.NEXT_PUBLIC_VOXIDE_KEY?.trim() ?? "";
  return key.startsWith("vox_pub_");
}
