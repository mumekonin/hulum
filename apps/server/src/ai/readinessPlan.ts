import { Language, type Analysis, type ReadinessItem, type ReadinessPlan } from "@hulum/shared";
import { isUnsafeExplanation } from "./guard.js";

const LANGUAGE_LABEL: Record<Language, string> = {
  [Language.ENGLISH]: "English",
  [Language.AMHARIC]: "Amharic",
  [Language.AFAAN_OROMO]: "Afaan Oromo",
};

export const READINESS_PLAN_SYSTEM_PROMPT =
  "You are HULUM's readiness coach. Use only the stored checklist JSON. Never change APPLY, MAYBE, or SKIP. Never invent new checklist items, deadlines, documents, or official URLs. Do not output JSON. Write a short personalized preparation plan in the requested language that covers every listed item title.";

export function fallbackReadinessPlan(analysis: Analysis): string {
  const items = analysis.readiness ?? [];
  if (items.length === 0) {
    return `${analysis.nextAction} No readiness checklist is stored yet. Confirm requirements on the official source; HULUM is not the organization.`;
  }
  const list = items.map((item) => `${item.title} (${item.status.replace("_", " ")})`).join("; ");
  return `${analysis.nextAction} Stored checklist: ${list}. Confirm details on the official source; HULUM is not the organization.`;
}

function itemTitles(items: ReadinessItem[]): string[] {
  return items.map((item) => item.title.trim()).filter((title) => title.length > 0);
}

/** Reject plans that invent items, URLs, JSON, or contradict the stored decision. */
export function isUnsafeReadinessPlan(analysis: Analysis, text: string): boolean {
  if (isUnsafeExplanation(analysis, text)) {
    return true;
  }
  const titles = itemTitles(analysis.readiness ?? []);
  if (titles.length === 0) {
    return false;
  }
  const lower = text.toLowerCase();
  const covered = titles.filter((title) => lower.includes(title.toLowerCase()));
  // Require a majority of stored titles so Groq cannot replace the checklist.
  return covered.length < Math.ceil(titles.length / 2);
}

export function sanitizeReadinessPlan(analysis: Analysis, text: string): string {
  if (isUnsafeReadinessPlan(analysis, text)) {
    return fallbackReadinessPlan(analysis);
  }
  return text.trim();
}

export function buildReadinessPlanMessages(
  analysis: Analysis,
  language: Language,
): Array<{ role: "system" | "user"; content: string }> {
  const facts = {
    decision: analysis.decision,
    fitScore: analysis.fitScore,
    nextAction: analysis.nextAction,
    readiness: (analysis.readiness ?? []).map((item) => ({
      title: item.title,
      status: item.status,
      description: item.description,
    })),
  };

  return [
    { role: "system", content: READINESS_PLAN_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Write a personalized readiness plan in ${LANGUAGE_LABEL[language]} for this stored HULUM analysis. The decision must stay ${analysis.decision}. Mention each checklist title.\n${JSON.stringify(facts)}`,
    },
  ];
}

export function readinessPlanFrom(
  analysis: Analysis,
  language: Language,
  text: string,
): ReadinessPlan {
  return {
    analysisId: analysis.id,
    decision: analysis.decision,
    fitScore: analysis.fitScore,
    nextAction: analysis.nextAction,
    plan: sanitizeReadinessPlan(analysis, text),
    language,
    items: (analysis.readiness ?? []).map((item) => ({
      title: item.title,
      status: item.status,
    })),
  };
}
