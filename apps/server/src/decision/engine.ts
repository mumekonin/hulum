import {
  APPLY_MIN_SCORE,
  DISCLAIMER,
  FIT_WEIGHTS,
  type AnalysisContract,
  type Decision,
  type Opportunity,
  type Profile,
  type ReadinessPriority,
  type RequirementStatus,
} from "@hulum/shared";
import { matchRequirement } from "./match.js";

/**
 * Decision rules (documented and tested):
 *
 * 1. Any critical requirement with status NOT_MET → SKIP
 * 2. Else if key requirements (country, education, field) are MET
 *    AND there is no significant uncertainty
 *    AND fitScore >= 75 → APPLY
 * 3. Else → MAYBE
 *
 * Significant uncertainty = any UNCERTAIN critical requirement,
 * or more than one UNCERTAIN key requirement.
 *
 * Fit score = weighted average of applicable requirements.
 * MET = full weight, UNCERTAIN = half weight, NOT_MET = 0.
 * NOT_APPLICABLE is excluded from the denominator.
 */
export function analyzeOpportunity(profile: Profile, opportunity: Opportunity): AnalysisContract {
  const requirements = (opportunity.requirements ?? []).map((requirement) => {
    const outcome = matchRequirement(profile, requirement, opportunity.deadline);
    return {
      key: requirement.key,
      status: outcome.status,
      evidence: outcome.evidence,
      reason: outcome.reason,
      critical: requirement.critical,
      requirementText: requirement.text,
      category: requirement.category,
    };
  });

  const fitScore = scoreRequirements(requirements);
  const decision = decide(requirements, fitScore);
  const gaps = requirements
    .filter((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN")
    .map((item) => ({
      requirement: item.requirementText,
      status: item.status,
      remediation: item.reason,
    }));

  const readiness = buildReadiness(opportunity, requirements, decision);
  const summary = buildSummary(decision, requirements);
  const nextAction = buildNextAction(decision, opportunity, readiness[0]?.title);

  return {
    decision,
    fitScore,
    summary,
    nextAction,
    explanation: summary,
    disclaimer: DISCLAIMER,
    requirements: requirements.map(({ category: _category, ...item }) => item),
    gaps,
    readiness,
  };
}

type Scored = {
  key: string;
  status: RequirementStatus;
  critical: boolean;
  category: keyof typeof FIT_WEIGHTS;
};

export function scoreRequirements(requirements: Scored[]): number {
  let earned = 0;
  let total = 0;

  for (const item of requirements) {
    if (item.status === "NOT_APPLICABLE") continue;
    const weight = FIT_WEIGHTS[item.category] ?? FIT_WEIGHTS.other;
    total += weight;
    if (item.status === "MET") earned += weight;
    if (item.status === "UNCERTAIN") earned += weight * 0.5;
  }

  if (total === 0) return 0;
  return Math.round((earned / total) * 100);
}

export function decide(requirements: Scored[], fitScore: number): Decision {
  const criticalMiss = requirements.some((item) => item.critical && item.status === "NOT_MET");
  if (criticalMiss) return "SKIP";

  const key = requirements.filter((item) => ["country", "education", "field"].includes(item.category));
  const keyMet = key.length > 0 && key.every((item) => item.status === "MET");
  const criticalUncertain = requirements.some((item) => item.critical && item.status === "UNCERTAIN");
  const keyUncertainCount = key.filter((item) => item.status === "UNCERTAIN").length;
  const significantUncertainty = criticalUncertain || keyUncertainCount > 1;

  if (keyMet && !significantUncertainty && fitScore >= APPLY_MIN_SCORE) {
    return "APPLY";
  }

  return "MAYBE";
}

function buildSummary(decision: Decision, requirements: Array<{ status: RequirementStatus; requirementText: string; critical: boolean }>): string {
  const met = requirements.filter((item) => item.status === "MET").map((item) => item.requirementText);
  const missing = requirements.filter((item) => item.status === "NOT_MET");
  const uncertain = requirements.filter((item) => item.status === "UNCERTAIN");

  if (decision === "APPLY") {
    return `You meet the key known requirements${met.length ? `: ${met.slice(0, 3).join("; ")}` : ""}. Prepare your application materials and confirm the official deadline.`;
  }

  if (decision === "SKIP") {
    const blocker = missing.find((item) => item.critical) ?? missing[0];
    return `A critical requirement is not met${blocker ? `: ${blocker.requirementText}` : ""}. Look for opportunities that match your current profile.`;
  }

  const unclear = uncertain[0]?.requirementText ?? missing[0]?.requirementText ?? "at least one requirement";
  return `You appear eligible, but this needs verification: ${unclear}. Do not treat this as an official eligibility decision.`;
}

function buildNextAction(
  decision: Decision,
  opportunity: Opportunity,
  firstTask?: string,
): string {
  if (decision === "SKIP") {
    return "Find opportunities matching your current profile.";
  }
  if (firstTask) return firstTask;
  return `Open the official source and confirm requirements: ${opportunity.organization}.`;
}

function buildReadiness(
  opportunity: Opportunity,
  requirements: Array<{ status: RequirementStatus; requirementText: string; key: string }>,
  decision: Decision,
): AnalysisContract["readiness"] {
  const items: AnalysisContract["readiness"] = [];

  const push = (title: string, description: string, priority: ReadinessPriority, status: AnalysisContract["readiness"][number]["status"] = "TODO") => {
    items.push({ title, status, description, priority });
  };

  if (decision === "SKIP") {
    push(
      "Do not apply to this opportunity",
      "A critical requirement is not met. Use HULUM to find a closer match instead of investing application time here.",
      "high",
      "NOT_REQUIRED",
    );
    push(
      "Verify the official source anyway",
      `If you believe the stored requirement is wrong, check ${opportunity.sourceUrl} before closing this path.`,
      "low",
    );
    return items;
  }

  push(
    "Verify deadline and eligibility on the official source",
    `Confirm details at ${opportunity.sourceUrl}. HULUM is not the issuing organization.`,
    "high",
  );

  for (const item of requirements.filter((row) => row.status === "UNCERTAIN" || row.status === "NOT_MET")) {
    push(
      `Resolve: ${item.requirementText}`,
      item.key === "documents" ? "Prepare or confirm this document before you apply." : "Check the official description and your records.",
      item.status === "NOT_MET" ? "high" : "medium",
    );
  }

  for (const doc of opportunity.documentRequirements) {
    if (!items.some((item) => item.title.toLowerCase().includes(doc.toLowerCase()))) {
      push(`Prepare ${doc}`, `Most applications for ${opportunity.title} expect this material.`, "medium");
    }
  }

  push("Prepare CV / resume", "Keep a current CV before starting the official form.", "high");
  push("Write motivation statement", "Draft why this opportunity fits your profile and goals.", "medium");

  return items.slice(0, 8);
}
