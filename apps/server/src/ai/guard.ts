import { Decision, type Analysis } from "@hulum/shared";

export const MIN_EXPLANATION_LENGTH = 24;

const DECISION_WORD = /\b(apply|maybe|skip)\b/gi;
const LOOKS_LIKE_JSON = /^\s*(?:\[|\{)/;
const INVENTED_URL = /\bhttps?:\/\//i;

export function fallbackExplanation(analysis: Analysis): string {
  return `${analysis.summary} ${analysis.nextAction}`.trim();
}

function mentionedDecisions(text: string): Decision[] {
  const found = new Set<Decision>();
  const matches = text.matchAll(DECISION_WORD);
  for (const match of matches) {
    const word = match[1];
    if (word === undefined) {
      continue;
    }
    const token = word.toUpperCase();
    if (token === Decision.APPLY || token === Decision.MAYBE || token === Decision.SKIP) {
      found.add(token);
    }
  }
  return [...found];
}

export function isUnsafeExplanation(analysis: Analysis, text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_EXPLANATION_LENGTH) {
    return true;
  }
  if (LOOKS_LIKE_JSON.test(trimmed)) {
    return true;
  }
  if (INVENTED_URL.test(trimmed)) {
    return true;
  }
  const mentioned = mentionedDecisions(trimmed);
  return mentioned.some((decision) => decision !== analysis.decision);
}

/** Keep Groq text when it is safe. Otherwise replace it with stored summary + nextAction. */
export function sanitizeExplanation(analysis: Analysis, text: string): string {
  if (isUnsafeExplanation(analysis, text)) {
    return fallbackExplanation(analysis);
  }
  return text.trim();
}
