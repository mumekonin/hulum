import { RequirementKey, RequirementStatus } from "@hulum/shared";

/** Fit score weights. Product signal only, not a guarantee. Sum = 100. */
export const FIT_SCORE_WEIGHTS = {
  [RequirementKey.COUNTRY]: 20,
  [RequirementKey.EDUCATION]: 20,
  [RequirementKey.FIELD]: 15,
  [RequirementKey.LANGUAGE]: 15,
  [RequirementKey.DEADLINE]: 15,
  [RequirementKey.EXPERIENCE]: 5,
  [RequirementKey.DOCUMENTS]: 5,
  [RequirementKey.OTHER]: 5,
} as const;

export const CRITICAL_REQUIREMENT_KEYS = [
  RequirementKey.COUNTRY,
  RequirementKey.EDUCATION,
  RequirementKey.DEADLINE,
] as const;

export const KEY_REQUIREMENT_KEYS = [
  RequirementKey.COUNTRY,
  RequirementKey.EDUCATION,
  RequirementKey.DEADLINE,
  RequirementKey.FIELD,
  RequirementKey.LANGUAGE,
] as const;

export const NEXT_ACTION = {
  APPLY: "Prepare your application materials and verify the official source.",
  MAYBE: "Verify the uncertain or missing requirements with the official source.",
  SKIP: "Find opportunities that match your current profile.",
} as const;

export function fitScorePoints(status: RequirementStatus, weight: number): number {
  if (status === RequirementStatus.MET || status === RequirementStatus.NOT_APPLICABLE) {
    return weight;
  }
  if (status === RequirementStatus.UNCERTAIN) {
    return weight / 2;
  }
  return 0;
}
