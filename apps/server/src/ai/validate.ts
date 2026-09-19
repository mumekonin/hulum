import { z } from "zod";
import { decisionSchema, type AnalysisContract, type Decision } from "@hulum/shared";

export const claudeExplanationSchema = z.object({
  decision: decisionSchema,
  explanation: z.string().min(1).max(2000),
});

/** Drop wording that contradicts the engine decision. */
export function sanitizeExplanation(text: string, decision: Decision, fallback: string): string {
  const cleaned = text.trim();
  if (!cleaned) return fallback;
  const mentioned = (["APPLY", "MAYBE", "SKIP"] as const).filter((item) => new RegExp(`\\b${item}\\b`).test(cleaned));
  if (mentioned.some((item) => item !== decision)) return fallback;
  return cleaned;
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? trimmed).trim();
  return JSON.parse(raw) as unknown;
}

function failsSafety(text: string, contract: AnalysisContract): boolean {
  if (/officially eligible|guaranteed (acceptance|admission|eligibility)|confirmed eligible/i.test(text)) {
    return true;
  }
  const uncertain =
    contract.requirements.some((item) => item.status === "UNCERTAIN") ||
    contract.gaps.some((item) => item.status === "UNCERTAIN");
  if (uncertain && /no uncertainty|definitely (meet|qualify)|certainly (meet|qualify)/i.test(text)) {
    return true;
  }
  return false;
}

/** Schema → consistency → safety. Malformed or contradictory Claude output becomes the engine summary. */
export function validateClaudeOutput(rawText: string, contract: AnalysisContract): string {
  const fallback = contract.summary;
  let parsed: unknown;
  try {
    parsed = parseJsonObject(rawText);
  } catch {
    return fallback;
  }

  const schema = claudeExplanationSchema.safeParse(parsed);
  if (!schema.success) return fallback;
  if (schema.data.decision !== contract.decision) return fallback;
  if (failsSafety(schema.data.explanation, contract)) return fallback;
  return sanitizeExplanation(schema.data.explanation, contract.decision, fallback);
}
