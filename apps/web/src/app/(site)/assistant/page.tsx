"use client";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { detectAskedLanguage, type LanguageCode, type ProfileView } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { StatusPanel } from "@/components/StatusPanel";
import { hasVoxidePublicKey } from "@/lib/voxide";
import { api, userFacingError } from "@/lib/api";
import { assistantCopy, assistantQuickActions } from "@/lib/assistant-copy";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getLanguage, getUserId, setLanguage } from "@/lib/storage";
import { runTextAction } from "@/lib/text-actions";
import { HULUM_VOICE_REPLY_EVENT, readVoiceSession, writeVoiceSession } from "@/lib/voice-session";

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
  const [language, setLanguageState] = useState<LanguageCode>(getLanguage);
  const [voxideReady] = useState(() => hasVoxidePublicKey());
  const requestInput = useRef<HTMLInputElement>(null);
  const opportunityId = sessionOpportunityId ?? search.get("opportunityId") ?? undefined;
  const analysisId = sessionAnalysisId ?? search.get("analysisId") ?? undefined;
  const needsProfile = Boolean(error?.toLowerCase().includes("profile"));
  const copy = useMemo(() => assistantCopy(language), [language]);
  const quickActions = useMemo(() => assistantQuickActions(language), [language]);

  useEffect(() => {
    const stored = readVoiceSession();
    if (stored.opportunityId) setSessionOpportunityId(stored.opportunityId);
    if (stored.analysisId) setSessionAnalysisId(stored.analysisId);
    const onVoiceReply = (event: Event) => {
      const detail = (event as CustomEvent<{ userText?: string; reply?: string }>).detail;
      const reply = detail?.reply?.trim() ?? "";
      if (reply === "") return;
      const userText = detail.userText?.trim() ?? "";
      setMessages((current) => [
        ...current,
        ...(userText === "" ? [] : [{ role: "user" as const, text: userText }]),
        { role: "hulum" as const, text: reply },
      ]);
    };
    window.addEventListener(HULUM_VOICE_REPLY_EVENT, onVoiceReply);
    return () => window.removeEventListener(HULUM_VOICE_REPLY_EVENT, onVoiceReply);
  }, []);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    let cancelled = false;
    void api<ProfileView>(`/api/profile/${userId}`)
      .then(() => {
        if (!cancelled) chooseLanguage(getLanguage(), false);
      })
      .catch(() => {
        // Keep the stored or default language.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function chooseLanguage(next: LanguageCode, _persistProfile: boolean) {
    setLanguageState(next);
    setLanguage(next);
  }

  const contextLabel = useMemo(() => {
    const voiceNote = voxideReady
      ? " Voxide widget tools call the same Postgres actions as text."
      : " Text actions call the Postgres API. Set NEXT_PUBLIC_VOXIDE_KEY (vox_pub_…) for the widget.";
    if (analysisId) return `This conversation is attached to your latest analysis.${voiceNote}`;
    if (opportunityId) return `This conversation is attached to a selected opportunity.${voiceNote}`;
    return `No analysis selected yet. You can still browse stored opportunities.${voiceNote}`;
  }, [analysisId, opportunityId, voxideReady]);

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

    // Last assistant reply only — never stores user utterances beyond the on-screen thread.
    if (/repeat|say (that|it) again|again please|ድገም/i.test(value.trim())) {
      setMessages((current) => {
        const last = [...current].reverse().find((message) => message.role === "hulum");
        const reply =
          last === undefined
            ? "Nothing to repeat yet. Ask a HULUM question first."
            : last.text;
        return [...current, { role: "hulum", text: reply }];
      });
      return;
    }

    setPending(true);
    try {
      const asked = detectAskedLanguage(value, getLanguage());
      chooseLanguage(asked, false);
      const response = await runTextAction({
        userId,
        text: value,
        opportunityId,
        analysisId,
        language: asked,
      });
      if (response.opportunityId) setSessionOpportunityId(response.opportunityId);
      if (response.analysisId) setSessionAnalysisId(response.analysisId);
      writeVoiceSession({
        opportunityId: response.opportunityId,
        analysisId: response.analysisId,
      });
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
    <section className="max-w-2xl" lang={language}>
      <h1 className="font-display text-4xl">{copy.title}</h1>
      <p className="mt-3 text-muted">{copy.intro}</p>
      <div className="mt-6">
        <Notice>{contextLabel}</Notice>
      </div>
      <fieldset className="mt-6 border-0 p-0">
        <legend className="text-sm font-medium">{copy.languageLegend}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((option) => (
            <label key={option.code} className="inline-flex min-h-11 items-center gap-2 border border-line px-3 py-2 text-sm">
              <input
                type="radio"
                name="assistant-language"
                value={option.code}
                checked={language === option.code}
                onChange={() => chooseLanguage(option.code, true)}
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{copy.languageHint}</p>
      </fieldset>
      {!voxideReady ? (
        <div id="voice-unavailable" className="mt-6">
          <StatusPanel
            variant="empty"
            title={copy.micMissingTitle}
            primary={{ label: copy.typeRequest, onClick: () => requestInput.current?.focus() }}
            secondary={{ label: copy.browseOpportunities, href: "/opportunities" }}
          >
            {copy.micMissingBody}
          </StatusPanel>
        </div>
      ) : (
        <div className="mt-6">
          <StatusPanel variant="empty" title={copy.voxideReadyTitle}>
            {copy.voxideReadyBody}
          </StatusPanel>
        </div>
      )}
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
        <legend className="text-sm font-medium">{copy.quickLegend}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={pending}
              onClick={() => void send(action)}
              lang={/[\u1200-\u137F]/.test(action) ? "am" : undefined}
              className="min-h-11 border border-line px-3 py-2 text-sm disabled:opacity-60"
            >
              {action}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 min-h-48 space-y-3" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && !pending && !error ? (
          <StatusPanel variant="empty" title="No question yet" primary={{ label: copy.showInternships, onClick: () => void send("Show me internships") }}>
            Type a request or use a quick action.
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
            ref={requestInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={copy.typePlaceholder}
            className="mt-1 min-h-11 w-full border border-line bg-white px-3 py-3"
            disabled={pending}
          />
        </label>
        <button disabled={pending} className="mt-auto min-h-11 bg-ink px-5 py-3 text-paper disabled:opacity-60">
          {pending ? "…" : copy.send}
        </button>
      </form>
    </section>
  );
}
