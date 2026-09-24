import {
  Decision,
  RequirementStatus,
  VerificationStatus,
  type DecisionAudit,
  type DecisionResult,
  type Opportunity,
  type Profile,
  type RequirementMatch,
} from "@hulum/shared";
import { matchRequirements } from "../requirements/match.js";
import type { Clock } from "../services/common/clock.js";
import { effectiveVerificationStatus } from "../verification/index.js";
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
 * Key requirements MET or NOT_APPLICABLE → APPLY (non-key UNCERTAIN docs/other do not block APPLY).
 * Otherwise → MAYBE.
 * Claude must not call this to change a stored decision.
 */
export function decide(profile: Profile, opportunity: Opportunity, clock: Clock): DecisionResult {
  const matches = matchRequirements(profile, opportunity, clock);

  const matchedRequirements = matches.filter((item) => item.status === RequirementStatus.MET);
  const missingRequirements = matches.filter((item) => item.status === RequirementStatus.NOT_MET);
  const uncertainRequirements = matches.filter(
    (item) => item.status === RequirementStatus.UNCERTAIN,
  );

  const criticalNotMet = CRITICAL_REQUIREMENT_KEYS.filter(
    (key) => statusOf(matches, key) === RequirementStatus.NOT_MET,
  );
  const keyStatuses = Object.fromEntries(
    KEY_REQUIREMENT_KEYS.map((key) => [key, statusOf(matches, key)]),
  ) as DecisionAudit["keyStatuses"];

  let decision: typeof Decision.APPLY | typeof Decision.MAYBE | typeof Decision.SKIP =
    Decision.MAYBE;
  let rulePath: DecisionAudit["rulePath"] = "default_maybe";

  if (criticalNotMet.length > 0) {
    decision = Decision.SKIP;
    rulePath = "critical_not_met";
  } else if (
    KEY_REQUIREMENT_KEYS.every((key) => {
      const status = statusOf(matches, key);
      return status === RequirementStatus.MET || status === RequirementStatus.NOT_APPLICABLE;
    })
  ) {
    decision = Decision.APPLY;
    rulePath = "keys_met_no_uncertainty";
  }

  const reasons = matches
    .filter((item) => item.status !== RequirementStatus.NOT_APPLICABLE)
    .map((item) => item.reason);

  const verification = effectiveVerificationStatus(opportunity, clock);
  // Stored or computed EXPIRED is never APPLY. HULUM is not the official listing.
  if (verification === VerificationStatus.EXPIRED) {
    decision = Decision.SKIP;
    rulePath = "expired_override";
    reasons.unshift(
      "This opportunity is expired. Confirm the deadline on the official source; HULUM is not the organization.",
    );
  }

  const nextAction =
    decision === Decision.APPLY
      ? NEXT_ACTION.APPLY
      : decision === Decision.SKIP
        ? NEXT_ACTION.SKIP
        : NEXT_ACTION.MAYBE;

  const audit: DecisionAudit = {
    rulePath,
    criticalKeys: [...CRITICAL_REQUIREMENT_KEYS],
    keyRequirementKeys: [...KEY_REQUIREMENT_KEYS],
    criticalNotMet: [...criticalNotMet],
    keyStatuses,
    uncertainKeys: uncertainRequirements.map((item) => item.key),
    effectiveVerificationStatus: verification,
    fitScoreIsAdvisoryOnly: true,
    decidedAt: clock.now().toISOString(),
  };

  return {
    decision,
    fitScore: computeFitScore(matches),
    matchedRequirements,
    missingRequirements,
    uncertainRequirements,
    reasons,
    nextAction,
    audit,
  };
}
