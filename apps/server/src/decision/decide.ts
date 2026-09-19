import {
  Decision,
  RequirementStatus,
  type DecisionResult,
  type Opportunity,
  type Profile,
  type RequirementMatch,
} from "@hulum/shared";
import { matchRequirements } from "../requirements/match.js";
import type { Clock } from "../services/common/clock.js";
import {
  CRITICAL_REQUIREMENT_KEYS,
  FIT_SCORE_WEIGHTS,
  KEY_REQUIREMENT_KEYS,
  NEXT_ACTION,
  fitScorePoints,
} from "./rules.js";

function statusOf(matches: RequirementMatch[], key: string): RequirementStatus {
  const row = matches.find((item) => item.key === key);
  if (row === undefined) {
    return RequirementStatus.UNCERTAIN;
  }
  return row.status;
}

function computeFitScore(matches: RequirementMatch[]): number {
  let total = 0;
  for (const match of matches) {
    const weight = FIT_SCORE_WEIGHTS[match.key];
    total += fitScorePoints(match.status, weight);
  }
  return Math.round(total);
}

/**
 * Critical NOT_MET → SKIP.
 * Key requirements MET or NOT_APPLICABLE, and no UNCERTAIN rows → APPLY.
 * Otherwise → MAYBE.
 * Claude must not call this to change a stored decision.
 */
export function decide(profile: Profile, opportunity: Opportunity, clock: Clock): DecisionResult {
  const matches = matchRequirements(profile, opportunity, clock);

  const matchedRequirements = matches.filter((item) => item.status === RequirementStatus.MET);
  const missingRequirements = matches.filter((item) => item.status === RequirementStatus.NOT_MET);
  const uncertainRequirements = matches.filter((item) => item.status === RequirementStatus.UNCERTAIN);

  let decision: typeof Decision.APPLY | typeof Decision.MAYBE | typeof Decision.SKIP = Decision.MAYBE;
  if (CRITICAL_REQUIREMENT_KEYS.some((key) => statusOf(matches, key) === RequirementStatus.NOT_MET)) {
    decision = Decision.SKIP;
  } else if (
    KEY_REQUIREMENT_KEYS.every((key) => {
      const status = statusOf(matches, key);
      return status === RequirementStatus.MET || status === RequirementStatus.NOT_APPLICABLE;
    }) &&
    uncertainRequirements.length === 0
  ) {
    decision = Decision.APPLY;
  }

  const reasons = matches
    .filter((item) => item.status !== RequirementStatus.NOT_APPLICABLE)
    .map((item) => item.reason);

  const nextAction =
    decision === Decision.APPLY
      ? NEXT_ACTION.APPLY
      : decision === Decision.SKIP
        ? NEXT_ACTION.SKIP
        : NEXT_ACTION.MAYBE;

  return {
    decision,
    fitScore: computeFitScore(matches),
    matchedRequirements,
    missingRequirements,
    uncertainRequirements,
    reasons,
    nextAction,
  };
}
