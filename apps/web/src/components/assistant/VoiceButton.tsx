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
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <rect x="7" y="7" width="10" height="10" />
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
      className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-2 border px-3 text-sm transition-colors disabled:opacity-60 ${
        live ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink"
      }`}
    >
      {live ? <StopIcon /> : <MicIcon />}
      {live ? <span className="hidden sm:inline">{LABELS[status] ?? "Connecting…"}</span> : null}
    </button>
  );
}
