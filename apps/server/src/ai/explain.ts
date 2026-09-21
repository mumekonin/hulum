import {
  Language,
  type Analysis,
  type AnalysisContract,
  type AnalysisExplanation,
  type Profile,
} from "@hulum/shared";
import { sanitizeExplanation as sanitizeGroqExplanation } from "./guard.js";
import { validateClaudeOutput } from "./validate.js";

export { sanitizeExplanation, validateClaudeOutput } from "./validate.js";

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
    requirements: (analysis.requirements ?? []).map((item) => ({
      key: item.key,
      status: item.status,
      text: item.text,
      reason: item.reason,
    })),
    readiness: (analysis.readiness ?? []).map((item) => ({
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
    explanation: sanitizeGroqExplanation(analysis, text),
    language,
  };
}

function claudeKey(): string | undefined {
  return process.env.CLAUDE_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim() || undefined;
}

function claudeModel(): string | undefined {
  return process.env.CLAUDE_MODEL?.trim() || process.env.ANTHROPIC_MODEL?.trim() || undefined;
}

export async function explainDecision(
  profile: Profile,
  contract: AnalysisContract,
): Promise<string> {
  const fallback = contract.summary;
  const apiKey = claudeKey();
  const model = claudeModel();
  if (!apiKey || !model) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Explain this HULUM decision in plain language for ${profile.name}. Reply with JSON only: {"decision":"${contract.decision}","explanation":"..."}. decision must equal ${contract.decision}. Do not invent eligibility facts or deadlines. Do not treat UNCERTAIN requirements as MET. Do not claim official eligibility.`,
          },
        ],
      }),
    });

    if (!response.ok) return fallback;
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    return validateClaudeOutput(payload.content?.[0]?.text ?? "", contract);
  } catch {
    return fallback;
  }
}
