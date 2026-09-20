import {
  Language,
  type Analysis,
  type AnalysisExplanation,
} from "@hulum/shared";
import { sanitizeExplanation } from "./guard.js";

const LANGUAGE_LABEL: Record<Language, string> = {
  [Language.ENGLISH]: "English",
  [Language.AMHARIC]: "Amharic",
  [Language.AFAAN_OROMO]: "Afaan Oromo",
};

export const EXPLAIN_SYSTEM_PROMPT =
  "You are HULUM's explainer. Use only the stored analysis JSON. Never change APPLY, MAYBE, or SKIP. Never invent deadlines, requirements, or official URLs. Do not output JSON. Write plain language in the requested language.";

export function buildExplainMessages(
  analysis: Analysis,
  language: Language,
): Array<{ role: "system" | "user"; content: string }> {
  const facts = {
    decision: analysis.decision,
    fitScore: analysis.fitScore,
    summary: analysis.summary,
    nextAction: analysis.nextAction,
    requirements: analysis.requirements.map((item) => ({
      key: item.key,
      status: item.status,
      text: item.text,
      reason: item.reason,
    })),
    readiness: analysis.readiness.map((item) => ({
      title: item.title,
      status: item.status,
    })),
  };

  return [
    { role: "system", content: EXPLAIN_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Explain this stored HULUM analysis in ${LANGUAGE_LABEL[language]}. The decision is already decided and must stay ${analysis.decision}.\n${JSON.stringify(facts)}`,
    },
  ];
}

export function explanationFrom(
  analysis: Analysis,
  language: Language,
  text: string,
): AnalysisExplanation {
  return {
    analysisId: analysis.id,
    decision: analysis.decision,
    fitScore: analysis.fitScore,
    nextAction: analysis.nextAction,
    explanation: sanitizeExplanation(analysis, text),
    language,
  };
}
