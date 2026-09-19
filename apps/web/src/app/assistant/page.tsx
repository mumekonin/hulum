"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { VoiceActionResponse } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";
import { getUserId } from "@/lib/storage";

const quickActions = [
  "Show me internships",
  "Should I apply for this?",
  "Why did you say that?",
  "What am I missing?",
  "What should I prepare?",
  "ምን ላዘጋጅ?",
];

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <StatusPanel variant="loading" title="Loading assistant">
          Preparing text and quick actions. Voice is not connected yet.
        </StatusPanel>
      }
    >
      <AssistantInner />
    </Suspense>
  );
}

function AssistantInner() {
  const search = useSearchParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "hulum"; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const [sessionOpportunityId, setSessionOpportunityId] = useState<string | undefined>();
  const [sessionAnalysisId, setSessionAnalysisId] = useState<string | undefined>();
  const opportunityId = sessionOpportunityId ?? search.get("opportunityId") ?? undefined;
  const analysisId = sessionAnalysisId ?? search.get("analysisId") ?? undefined;
  const needsProfile = Boolean(error?.toLowerCase().includes("profile"));

  const contextLabel = useMemo(() => {
    if (analysisId) return "This conversation is attached to your latest analysis.";
    if (opportunityId) return "This conversation is attached to a selected opportunity.";
    return "No analysis selected yet. You can still browse or filter opportunities by voice/text.";
  }, [analysisId, opportunityId]);

  async function send(value: string, echo = true) {
    const userId = getUserId();
    if (!userId) {
      setError("Create a profile first so HULUM knows who you are.");
      setLastFailed(value);
      return;
    }
    setError(null);
    setLastFailed(null);
    if (echo) {
      setMessages((current) => [...current, { role: "user", text: value }]);
    }
    setPending(true);
    try {
      const response = await api<VoiceActionResponse>("/api/voice/action", {
        method: "POST",
        body: JSON.stringify({ userId, text: value, opportunityId, analysisId, language: "en" }),
      });
      if (response.opportunity?.id) setSessionOpportunityId(response.opportunity.id);
      if (response.analysis?.id) setSessionAnalysisId(response.analysis.id);
      setMessages((current) => [...current, { role: "hulum", text: response.reply }]);
    } catch (err) {
      setLastFailed(value);
      setError(userFacingError(err));
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    setText("");
    void send(value);
  }

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl">Ask HULUM</h1>
      <p className="mt-3 text-muted">
        Voice must perform real product actions. v0.1 ships with text and quick actions so a missing Voxide
        key cannot kill the demo.
      </p>
      <div className="mt-6">
        <Notice>{contextLabel}</Notice>
      </div>
      {error ? (
        <StatusPanel
          variant="error"
          title={needsProfile ? "Profile needed" : "We couldn't complete that request"}
          primary={
            needsProfile
              ? { label: "Open profile", href: "/profile" }
              : lastFailed
                ? { label: "Try again", onClick: () => void send(lastFailed, false) }
                : undefined
          }
        >
          {error}
        </StatusPanel>
      ) : null}
      <fieldset className="mt-6 border-0 p-0">
        <legend className="text-sm font-medium">Quick actions</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={pending}
              onClick={() => void send(action)}
              lang={action === "ምን ላዘጋጅ?" ? "am" : undefined}
              className="min-h-11 border border-line px-3 py-2 text-sm disabled:opacity-60"
            >
              {action}
            </button>
          ))}
          <button
            type="button"
            disabled
            className="min-h-11 border border-dashed border-line px-3 py-2 text-sm text-muted"
            aria-describedby="voice-unavailable"
          >
            Voice (not connected)
          </button>
        </div>
        <p id="voice-unavailable" className="mt-2 text-sm text-muted">
          Microphone input waits until Voxide is wired. Type a request or use a quick action.
        </p>
      </fieldset>
      <div className="mt-6 min-h-48 space-y-3" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && !pending && !error ? (
          <StatusPanel variant="empty" title="No question yet" primary={{ label: "Show internships", onClick: () => void send("Show me internships") }}>
            Type a request or use a quick action. Microphone input waits until Voxide is wired.
          </StatusPanel>
        ) : null}
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={message.role === "hulum" ? "border border-line bg-white/70 p-4" : "text-muted"}>
            <span className="block text-xs uppercase tracking-wide">{message.role === "hulum" ? "HULUM" : "You"}</span>
            {message.text}
          </p>
        ))}
        {pending ? (
          <StatusPanel variant="loading" title="HULUM is responding">
            Running the same product actions as the screens, not a free-form chatbot.
          </StatusPanel>
        ) : null}
      </div>
      {analysisId ? (
        <p className="mt-4 text-sm">
          <Link href={`/analysis/${analysisId}`} className="underline">
            Open the APPLY / MAYBE / SKIP result
          </Link>
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-2">
        <label className="min-w-[12rem] flex-1 text-sm">
          Your request
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Should I apply for this?"
            className="mt-1 min-h-11 w-full border border-line bg-white px-3 py-3"
            disabled={pending}
          />
        </label>
        <button disabled={pending} className="mt-auto min-h-11 bg-ink px-5 py-3 text-paper disabled:opacity-60">
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </section>
  );
}
