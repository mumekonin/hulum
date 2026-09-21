"use client";

import { useMemo, useRef } from "react";
import { VoxideClient, VoxideWidget } from "@voxide/react";
import type { LanguageCode, VoiceActionResponse } from "@hulum/shared";
import { api } from "@/lib/api";
import { getUserId } from "@/lib/storage";

type Props = {
  language: LanguageCode;
  opportunityId?: string;
  analysisId?: string;
  onReply: (userText: string, response: VoiceActionResponse) => void;
  onError: (message: string) => void;
};

function publicKey(): string | null {
  const value =
    process.env.NEXT_PUBLIC_VOXIDE_PUBLIC_KEY?.trim() || process.env.NEXT_PUBLIC_VOXIDE_KEY?.trim() || "";
  if (!value.startsWith("vox_pub_")) {
    return null;
  }
  return value;
}

/** Optional browser widget. Absent without a publishable key; text fallback stays. */
export function VoxidePanel(props: Props) {
  const key = publicKey();
  if (!key) {
    return null;
  }
  return <VoxidePanelInner {...props} publicKey={key} />;
}

export function hasVoxidePublicKey(): boolean {
  return publicKey() !== null;
}

function VoxidePanelInner({ publicKey: key, ...props }: Props & { publicKey: string }) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const client = useMemo(() => {
    const ai = new VoxideClient({ publicKey: key });
    ai.register({
      runHulumRequest: {
        description:
          "Run a HULUM request: show or filter opportunities, analyze APPLY/MAYBE/SKIP, explain a decision, list gaps, or readiness.",
        params: {
          text: {
            type: "string",
            required: true,
            description: "The user's request in natural language.",
          },
        },
        handler: async ({ text }) => {
          const { language, opportunityId, analysisId, onReply, onError } = propsRef.current;
          const userId = getUserId();
          if (!userId) {
            onError("Create a profile first so HULUM knows who you are.");
            return { ok: false, error: "profile_required" };
          }
          const utterance = String(text ?? "").trim();
          if (!utterance) {
            return { ok: false, error: "empty_text" };
          }
          try {
            const response = await api<VoiceActionResponse>("/api/voice/action", {
              method: "POST",
              body: JSON.stringify({
                userId,
                text: utterance,
                opportunityId,
                analysisId,
                language,
              }),
            });
            onReply(utterance, response);
            return { ok: true, reply: response.reply, intent: response.intent };
          } catch (error) {
            const message = error instanceof Error ? error.message : "HULUM request failed.";
            onError(message);
            return { ok: false, error: message };
          }
        },
      },
    });
    return ai;
  }, [key]);

  return (
    <div className="mt-6" data-testid="voxide-widget">
      <p className="mb-2 text-sm text-muted">
        Voxide widget is mounted with a publishable key. APPLY / MAYBE / SKIP still come from HULUM’s engine via
        registered capabilities.
      </p>
      <VoxideWidget client={client} theme="auto" />
    </div>
  );
}
