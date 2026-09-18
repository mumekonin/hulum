"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { VoiceActionResponse } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { api } from "@/lib/api";
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
    <Suspense fallback={<p>Loading assistant…</p>}>
      <AssistantInner />
    </Suspense>
  );
}

function AssistantInner() {
  const search = useSearchParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "hulum"; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const opportunityId = search.get("opportunityId") ?? undefined;
  const analysisId = search.get("analysisId") ?? undefined;

  const contextLabel = useMemo(() => {
    if (analysisId) return "This conversation is attached to your latest analysis.";
    if (opportunityId) return "This conversation is attached to a selected opportunity.";
    return "No analysis selected yet. You can still browse or filter opportunities by voice/text.";
  }, [analysisId, opportunityId]);

  async function send(value: string) {
    const userId = getUserId();
    if (!userId) {
      setError("Create a profile first so HULUM knows who you are.");
      return;
    }
    setError(null);
    setMessages((current) => [...current, { role: "user", text: value }]);
    try {
      const response = await api<VoiceActionResponse>("/api/voice/action", {
        method: "POST",
        body: JSON.stringify({ userId, text: value, opportunityId, analysisId, language: "en" }),
      });
      setMessages((current) => [...current, { role: "hulum", text: response.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice action failed. Type your request instead.");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
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
        <p className="mt-4 text-skip">
          {error} {error.includes("profile") ? <Link href="/profile" className="underline">Open profile</Link> : null}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button key={action} type="button" onClick={() => void send(action)} className="border border-line px-3 py-2 text-sm">
            {action}
          </button>
        ))}
      </div>
      <div className="mt-6 min-h-48 space-y-3">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={message.role === "hulum" ? "border border-line bg-white/70 p-4" : "text-muted"}>
            <span className="block text-xs uppercase tracking-wide">{message.role === "hulum" ? "HULUM" : "You"}</span>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Should I apply for this?"
          className="flex-1 border border-line bg-white px-3 py-3"
        />
        <button className="bg-ink px-5 py-3 text-paper">Send</button>
      </form>
    </section>
  );
}
