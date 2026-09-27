/**
 * Recent Ask HULUM questions, kept only in this browser and scoped to the signed-in user.
 * Nothing is sent to the server (retention.md: no utterance text is stored server-side).
 * Cleared on sign-out by clearSession().
 */

export const RECENT_QUESTIONS_PREFIX = "hulum.recent.";
const MAX_RECENT = 10;

export type RecentQuestion = {
  text: string;
  opportunityId?: string;
  analysisId?: string;
  askedAt: string;
};

function keyFor(userId: string): string {
  return `${RECENT_QUESTIONS_PREFIX}${userId}`;
}

function isRecentQuestion(value: unknown): value is RecentQuestion {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.text === "string" && typeof row.askedAt === "string";
}

export function readRecentQuestions(userId: string): RecentQuestion[] {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecentQuestion).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function rememberQuestion(
  userId: string,
  question: Omit<RecentQuestion, "askedAt">,
): RecentQuestion[] {
  const text = question.text.trim();
  if (text === "") return readRecentQuestions(userId);
  const next = [
    { ...question, text, askedAt: new Date().toISOString() },
    ...readRecentQuestions(userId).filter((item) => item.text.toLowerCase() !== text.toLowerCase()),
  ].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    // Storage full or disabled: the question still runs.
  }
  return next;
}
