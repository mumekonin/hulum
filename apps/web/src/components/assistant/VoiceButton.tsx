"use client";

import { useState } from "react";
import type { VoxideClient, VoxideStatus } from "@voxide/react";

const LIVE: VoxideStatus[] = ["connecting", "listening", "thinking", "executing", "speaking"];

const LABELS: Partial<Record<VoxideStatus, string>> = {
  connecting: "Connecting…",
  listening: "Listening",
  thinking: "Checking…",
  executing: "Checking…",
  speaking: "Speaking",
};

function MicIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 2.75A3.75 3.75 0 0 0 8.25 6.5v5a3.75 3.75 0 1 0 7.5 0v-5A3.75 3.75 0 0 0 12 2.75Z" />
      <path d="M6.5 11.25a.75.75 0 0 0-1.5 0 7 7 0 0 0 6.25 6.96V20.5H8.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5H12.75v-2.29A7 7 0 0 0 19 11.25a.75.75 0 0 0-1.5 0 5.5 5.5 0 0 1-11 0Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    </svg>
  );
}

export function isVoiceLive(status: VoxideStatus): boolean {
  return LIVE.includes(status);
}

/** Starts or stops the shared browser Voxide session; replies arrive through the voice reply event. */
export function VoiceButton({
  client,
  status,
  disabled,
  onIssue,
}: {
  client: VoxideClient;
  status: VoxideStatus;
  disabled: boolean;
  onIssue: (message: string | null) => void;
}) {
  const [starting, setStarting] = useState(false);
  const live = isVoiceLive(status) || starting;

  async function toggle() {
    if (live) {
      client.disconnect();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onIssue("This browser can't use a microphone here. Type your question instead.");
      return;
    }
    onIssue(null);
    setStarting(true);
    try {
      if (status === "error") {
        client.disconnect();
      }
      if (!client.isInitialized) {
        await client.init();
      }
      await client.connect();
    } catch {
      onIssue("Voice didn't connect. Check microphone permission, or type your question instead.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={disabled && !live}
      aria-pressed={live}
      aria-label={live ? "Stop voice" : "Speak to HULUM"}
      title={live ? "Stop voice" : "Speak to HULUM"}
      className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 border px-3 text-sm transition-colors disabled:opacity-60 ${
        live ? "border-ink bg-ink text-paper" : "border-line-strong bg-surface text-ink hover:border-ink hover:bg-ink hover:text-paper"
      }`}
    >
      {live ? <StopIcon /> : <MicIcon />}
      {live ? <span className="hidden sm:inline">{LABELS[status] ?? "Connecting…"}</span> : null}
    </button>
  );
}
