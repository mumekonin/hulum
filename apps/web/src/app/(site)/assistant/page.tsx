"use client";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  detectAskedLanguage,
  type Analysis,
  type LanguageCode,
  type Opportunity,
  type ProfileDocument,
  type ProfileView,
} from "@hulum/shared";
import { ChatMessageView } from "@/components/assistant/ChatMessageView";
import { FrequentlyAsked, RecentQuestions } from "@/components/assistant/AssistantSidebar";
import { StatusPanel } from "@/components/StatusPanel";
import { hasVoxidePublicKey } from "@/lib/voxide";
import { api, isNotFound, userFacingError } from "@/lib/api";
import { assistantCopy, assistantQuickActions } from "@/lib/assistant-copy";
import { btnPrimary } from "@/lib/ui";
import {
  hulumMessageFrom,
  messageId,
  type BatchCard,
  type ChatMessage,
  type ChatPrompt,
  type HulumMessage,
} from "@/lib/chat";
import { readDiscoverContext, type DiscoverContext } from "@/lib/discover-context";
import type { FaqEntry } from "@/lib/faq";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { completionPercent, isCvDocument } from "@/lib/profile-form";
import { readRecentQuestions, rememberQuestion, type RecentQuestion } from "@/lib/recent-questions";
import { getLanguage, getUserId, setLanguage } from "@/lib/storage";
import { PROFILE_FIELD_LABELS, runTextAction } from "@/lib/text-actions";
import {
  clearVoiceSession,
  HULUM_VOICE_REPLY_EVENT,
  readVoiceSession,
  writeVoiceSession,
  type VoiceReplyDetail,
} from "@/lib/voice-session";
import { useVoxideClient, useVoxideStatus } from "@/lib/voxide-client";
import { isVoiceLive, VoiceButton } from "@/components/assistant/VoiceButton";

const DEFAULT_PROMPTS: ChatPrompt[] = [
  { label: "Should I apply?", text: "Should I apply for this?" },
  { label: "What am I missing?", text: "What am I missing?" },
  { label: "Find opportunities for me", text: "Show me opportunities I should apply for" },
  { label: "What should I prepare?", text: "What should I prepare?" },
];

const OPPORTUNITY_PROMPTS: ChatPrompt[] = [
  { label: "Should I apply?", text: "Should I apply for this?" },
  { label: "What am I missing?", text: "What am I missing?" },
  { label: "What should I prepare?", text: "What should I prepare?" },
  { label: "Explain the requirements", text: "Tell me about this opportunity" },
];

const BATCH_PROMPT: ChatPrompt = {
  label: "Which of these should I apply for?",
  text: "Which of these should I apply for?",
};

const REPEAT_PATTERN = /repeat|say (that|it) again|again please|ድገም/i;
const BATCH_PATTERN = /which (ones?|of these|of them)|these results|from my search/i;
const PROFILE_ADVICE_PATTERN =
  /improve my profile|what should i add|complete my profile|profile (tips|advice)/i;
type ProfileState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; missing: string[]; hasCv: boolean };

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <StatusPanel variant="loading" title="Loading Ask HULUM">
          Preparing your conversation.
        </StatusPanel>
      }
    >
      <AssistantInner />
    </Suspense>
  );
}

function AssistantInner() {
  const search = useSearchParams();
  const [userId] = useState(() => getUserId());
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const [opportunityId, setOpportunityId] = useState<string | undefined>(
    () => search.get("opportunityId") ?? readVoiceSession().opportunityId,
  );
  const [analysisId, setAnalysisId] = useState<string | undefined>(
    () => search.get("analysisId") ?? readVoiceSession().analysisId,
  );
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [discover] = useState<DiscoverContext | null>(() =>
    search.get("from") === "discover" ? readDiscoverContext() : null,
  );
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [recent, setRecent] = useState<RecentQuestion[]>(() =>
    userId ? readRecentQuestions(userId) : [],
  );
  const [language, setLanguageState] = useState<LanguageCode>(getLanguage);
  const [voxideReady] = useState(() => hasVoxidePublicKey());
  const voiceClient = useVoxideClient();
  const voice = useVoxideStatus(voiceClient);
  const [voiceIssue, setVoiceIssue] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const threadEnd = useRef<HTMLDivElement>(null);
  const needsProfile = Boolean(error?.toLowerCase().includes("profile"));
  const copy = useMemo(() => assistantCopy(language), [language]);
  const quickPrompts = useMemo<ChatPrompt[]>(() => {
    if (language === "en") return opportunity ? OPPORTUNITY_PROMPTS : DEFAULT_PROMPTS;
    return assistantQuickActions(language).map((action) => ({ label: action, text: action }));
  }, [language, opportunity]);

  useEffect(() => {
    const onVoiceReply = (event: Event) => {
      const detail = (event as CustomEvent<Partial<VoiceReplyDetail>>).detail;
      const reply = detail?.reply?.trim() ?? "";
      if (reply === "") return;
      const userText = detail.userText?.trim() ?? "";
      const result = detail.result;
      if (result?.opportunityId) setOpportunityId(result.opportunityId);
      if (result?.analysisId) setAnalysisId(result.analysisId);
      if (userId && userText !== "") setRecent(rememberQuestion(userId, { text: userText }));
      setMessages((current) => [
        ...current,
        ...(userText === "" ? [] : [{ id: messageId(), role: "user" as const, text: userText }]),
        result
          ? hulumMessageFrom(result, detectAskedLanguage(userText, getLanguage()))
          : { id: messageId(), role: "hulum" as const, text: reply },
      ]);
    };
    window.addEventListener(HULUM_VOICE_REPLY_EVENT, onVoiceReply);
    return () => window.removeEventListener(HULUM_VOICE_REPLY_EVENT, onVoiceReply);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setProfile({ status: "missing" });
      return;
    }
    let cancelled = false;
    void Promise.all([
      api<ProfileView>(`/api/profile/${userId}`),
      api<ProfileDocument[]>(`/api/profile/${userId}/documents`).catch(
        () => [] as ProfileDocument[],
      ),
    ])
      .then(([view, documents]) => {
        if (cancelled) return;
        setProfile({
          status: "ready",
          missing: view.completeness.missing,
          hasCv: documents.some(isCvDocument),
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setProfile({ status: isNotFound(err) ? "missing" : "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!opportunityId) {
      setOpportunity(null);
      return;
    }
    let cancelled = false;
    void api<Opportunity>(`/api/opportunities/${opportunityId}`)
      .then((item) => {
        if (!cancelled) setOpportunity(item);
      })
      .catch(() => {
        if (!cancelled) setOpportunity(null);
      });
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  useEffect(() => {
    if (messages.length > 0)
      threadEnd.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "end",
      });
  }, [messages.length, pending]);

  function chooseLanguage(next: LanguageCode) {
    setLanguageState(next);
    setLanguage(next);
  }

  function append(...next: ChatMessage[]) {
    setMessages((current) => [...current, ...next]);
  }

  function clearOpportunityContext() {
    setOpportunityId(undefined);
    setAnalysisId(undefined);
    clearVoiceSession();
  }

  function profileAdvice(): HulumMessage {
    if (profile.status !== "ready") {
      return {
        id: messageId(),
        role: "hulum",
        text: "You don't have a HULUM profile yet. Create one so HULUM can compare opportunities with your background.",
        links: [{ label: "Create profile", href: "/profile" }],
      };
    }
    const fields = profile.missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field);
    if (fields.length === 0 && profile.hasCv) {
      return {
        id: messageId(),
        role: "hulum",
        text: "Your profile has every field HULUM matches on, and a CV. Keep it current as your education and experience change.",
        links: [{ label: "Edit profile", href: "/profile" }],
      };
    }
    const gaps = [...fields, ...(profile.hasCv ? [] : ["a CV"])];
    return {
      id: messageId(),
      role: "hulum",
      text: `Your profile is missing ${gaps.join(", ")}. Adding ${gaps.length === 1 ? "it" : "them"} helps HULUM understand which opportunities fit you — anything left out is treated as uncertain, never guessed.`,
      links: [
        { label: "Complete profile", href: "/profile" },
        ...(profile.hasCv ? [] : [{ label: "Upload CV", href: "/profile" }]),
      ],
    };
  }

  async function analyzeDiscoverResults(
    context: DiscoverContext,
    currentUser: string,
  ): Promise<HulumMessage> {
    const rows: BatchCard["rows"] = [];
    const failed: string[] = [];
    for (const item of context.items) {
      setPending(`Analyzing ${rows.length + failed.length + 1} of ${context.items.length}…`);
      try {
        const result = await api<Analysis>(`/api/opportunities/${item.id}/analyze`, {
          method: "POST",
          body: JSON.stringify({ userId: currentUser }),
        });
        rows.push({
          opportunityId: item.id,
          analysisId: result.id,
          title: item.title,
          decision: result.decision,
        });
      } catch (err) {
        if (
          rows.length === 0 &&
          isNotFound(err) &&
          userFacingError(err).toLowerCase().includes("profile")
        )
          throw err;
        failed.push(item.title);
      }
    }
    const count = (decision: string) => rows.filter((row) => row.decision === decision).length;
    const partial =
      context.total > context.items.length
        ? ` I checked the first ${context.items.length} of ${context.total} results.`
        : "";
    return {
      id: messageId(),
      role: "hulum",
      text: `I compared ${rows.length} ${rows.length === 1 ? "opportunity" : "opportunities"} from your search with your profile: ${count("APPLY")} APPLY, ${count("MAYBE")} MAYBE, ${count("SKIP")} SKIP.${partial}`,
      card: { kind: "batch", rows, failed },
    };
  }

  async function send(value: string, options: { echo?: boolean; label?: string } = {}) {
    const { echo = true, label } = options;
    if (!userId) {
      setError("Create a profile first so HULUM knows who you are.");
      setLastFailed(value);
      return;
    }
    setError(null);
    setLastFailed(null);
    if (echo) append({ id: messageId(), role: "user", text: label ?? value });

    // Repeats only the on-screen reply; utterances are never stored server-side.
    if (REPEAT_PATTERN.test(value.trim())) {
      setMessages((current) => {
        const last = [...current].reverse().find((message) => message.role === "hulum");
        return [
          ...current,
          last
            ? { ...last, id: messageId() }
            : {
                id: messageId(),
                role: "hulum",
                text: "Nothing to repeat yet. Ask a HULUM question first.",
              },
        ];
      });
      return;
    }

    if (echo) {
      setRecent(
        rememberQuestion(userId, {
          text: label ?? value,
          ...(opportunityId ? { opportunityId } : {}),
          ...(analysisId ? { analysisId } : {}),
        }),
      );
    }

    if (PROFILE_ADVICE_PATTERN.test(value)) {
      append(profileAdvice());
      return;
    }

    const batchContext = BATCH_PATTERN.test(value) ? (discover ?? readDiscoverContext()) : null;
    setPending("HULUM is checking…");
    try {
      if (batchContext && batchContext.items.length > 0) {
        append(await analyzeDiscoverResults(batchContext, userId));
        return;
      }
      const asked = detectAskedLanguage(value, getLanguage());
      chooseLanguage(asked);
      const response = await runTextAction({
        userId,
        text: value,
        opportunityId,
        analysisId,
        language: asked,
      });
      if (response.opportunityId) setOpportunityId(response.opportunityId);
      if (response.analysisId) setAnalysisId(response.analysisId);
      writeVoiceSession({ opportunityId: response.opportunityId, analysisId: response.analysisId });
      append(hulumMessageFrom(response, asked));
    } catch (err) {
      setLastFailed(value);
      setError(userFacingError(err));
    } finally {
      setPending(null);
    }
  }

  function ask(prompt: ChatPrompt) {
    if (pending) return;
    void send(prompt.text, { label: prompt.label === prompt.text ? undefined : prompt.label });
  }

  function showFaq(entry: FaqEntry) {
    append(
      { id: messageId(), role: "user", text: entry.question },
      {
        id: messageId(),
        role: "hulum",
        text: entry.answer,
        ...(entry.links ? { links: entry.links } : {}),
      },
    );
  }

  function askAgain(item: RecentQuestion) {
    if (pending) return;
    if (item.opportunityId) setOpportunityId(item.opportunityId);
    if (item.analysisId) setAnalysisId(item.analysisId);
    void send(item.text);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    setText("");
    void send(value);
  }

  const completion = profile.status === "ready" ? completionPercent(profile.missing) : null;
  const voiceNote = !voxideReady
    ? `${copy.micMissingTitle} — type or use a quick prompt.`
    : voiceIssue
      ? voiceIssue
      : voice.status === "error"
        ? voice.errorCode === "usage_limit"
          ? "Voice is unavailable right now. Type your question instead."
          : "Voice didn't stay connected. Tap the microphone to try again, or type."
        : isVoiceLive(voice.status)
          ? "Voice is on. Ask your question out loud; answers appear here."
          : voiceClient === null
            ? "Voice is loading. You can type in the meantime."
            : language === "en"
              ? "Tap the mic to speak, or type."
              : "Tap the mic to speak, or type. Speech recognition is most reliable in English; replies follow your language.";
  const emptyPrompts =
    discover && discover.items.length > 0 ? [BATCH_PROMPT, ...quickPrompts] : quickPrompts;

  return (
    <section lang={language}>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-4xl">{copy.title}</h1>
          <p className="mt-2 text-muted">Your opportunity decision assistant.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          Reply in
          <select
            value={language}
            onChange={(event) => chooseLanguage(event.target.value as LanguageCode)}
            className="min-h-11 border border-line bg-surface px-2 text-ink"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {profile.status === "ready" ? (
          <p className="text-muted">
            <span
              aria-hidden
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-apply align-middle"
            />
            Using your HULUM profile · {completion}% complete{" "}
            <Link href="/profile" className="text-ink underline underline-offset-4">
              View profile
            </Link>
          </p>
        ) : null}
        {profile.status === "missing" ? (
          <p className="text-muted">
            No profile yet — answers can't be personal.{" "}
            <Link href="/profile" className="text-ink underline underline-offset-4">
              Create profile
            </Link>
          </p>
        ) : null}
        {profile.status === "error" ? (
          <p className="text-muted">Couldn't load your profile right now.</p>
        ) : null}
      </div>

      {opportunity ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-l-2 border-ink bg-surface-muted px-4 py-3 text-sm">
          <p>
            <span className="text-muted">Talking about </span>
            <Link
              href={`/opportunities/${opportunity.id}${analysisId ? `?analysisId=${analysisId}` : ""}`}
              className="underline underline-offset-4"
            >
              {opportunity.title}
            </Link>
          </p>
          <button
            type="button"
            onClick={clearOpportunityContext}
            className="min-h-11 text-muted underline underline-offset-4 hover:text-ink"
          >
            Clear context
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          {messages.length === 0 ? (
            <div className="py-6">
              <p className="font-display text-2xl leading-snug">
                {opportunity
                  ? `Ask me anything about ${opportunity.title}.`
                  : discover
                    ? `You're looking at ${discover.total} ${discover.total === 1 ? "result" : "results"}${discover.query ? ` for ${discover.query}` : ""}. Ask which ones are worth applying for.`
                    : "Ask me anything about opportunities, eligibility, or what you should prepare."}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {emptyPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => ask(prompt)}
                    lang={language === "en" ? undefined : language}
                    className="min-h-11 border border-line-strong px-4 text-sm transition-colors hover:border-ink disabled:opacity-60"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="divide-y divide-line" aria-live="polite" aria-relevant="additions">
              {messages.map((message) => (
                <ChatMessageView
                  key={message.id}
                  message={message}
                  onPrompt={ask}
                  disabled={Boolean(pending)}
                />
              ))}
            </ol>
          )}

          {pending ? (
            <p className="flex items-center gap-2 py-4 text-sm text-muted" role="status">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ink"
              />
              {pending}
            </p>
          ) : null}

          {error ? (
            <div className="py-4">
              <StatusPanel
                variant="error"
                title={needsProfile ? "Profile needed" : "We couldn't complete that request"}
                primary={
                  needsProfile
                    ? { label: "Open profile", href: "/profile" }
                    : lastFailed
                      ? {
                          label: "Try again",
                          onClick: () => void send(lastFailed, { echo: false }),
                        }
                      : undefined
                }
              >
                {error}
              </StatusPanel>
            </div>
          ) : null}

          <div ref={threadEnd} />

          <form
            onSubmit={submit}
            className="sticky bottom-0 mt-4 border-t border-line bg-paper pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          >
            {messages.length > 0 ? (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    disabled={Boolean(pending)}
                    onClick={() => ask(prompt)}
                    lang={language === "en" ? undefined : language}
                    className="min-h-11 shrink-0 border border-line px-3 text-sm text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="ask-input">
                Ask HULUM
              </label>
              <input
                id="ask-input"
                ref={input}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  language === "en" ? "Ask HULUM about an opportunity…" : copy.typePlaceholder
                }
                className="hulum-field min-h-12 min-w-0 flex-1 border border-line-strong bg-surface px-4"
                disabled={Boolean(pending)}
                autoComplete="off"
              />
              <button
                disabled={Boolean(pending) || text.trim() === ""}
                className={btnPrimary}
              >
                {copy.send}
              </button>
              {voiceClient ? (
                <VoiceButton
                  client={voiceClient}
                  status={voice.status}
                  disabled={Boolean(pending)}
                  onIssue={setVoiceIssue}
                />
              ) : null}
            </div>
            <p className="mt-2 text-xs text-muted" role="status">
              {voiceNote} HULUM explains decisions; it never submits applications for you.
            </p>
          </form>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-8 lg:self-start lg:border-l lg:border-line lg:pl-8">
          <RecentQuestions items={recent} onSelect={askAgain} disabled={Boolean(pending)} />
          <FrequentlyAsked onSelect={showFaq} disabled={Boolean(pending)} />
        </aside>
      </div>
    </section>
  );
}
