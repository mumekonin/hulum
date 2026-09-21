import {
  analysisContractSchema,
  type Analysis,
  type AnalysisDetail,
  type Opportunity,
  type Profile,
  type RequirementResult,
} from "@hulum/shared";
import { explainDecision } from "../ai/explain.js";
import { analyzeOpportunity } from "../decision/engine.js";
import { createId, nowIso } from "../lib/id.js";
import { loadStore, mutateStore } from "../store/fileStore.js";

export type AnalysisFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
};

export type AnalysisSuccess = {
  ok: true;
  detail: AnalysisDetail;
};

export async function runAnalysis(
  userId: string,
  opportunityId: string,
): Promise<AnalysisSuccess | AnalysisFailure> {
  const store = await loadStore();
  const opportunity = store.opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) {
    return {
      ok: false,
      status: 404,
      code: "OPPORTUNITY_NOT_FOUND",
      message: "Opportunity not found.",
    };
  }

  const profile = store.profiles.find((item) => item.userId === userId);
  if (!profile) {
    return {
      ok: false,
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "Create a profile before asking HULUM to analyze.",
    };
  }

  const contract = analyzeOpportunity(profile, opportunity);
  const valid = analysisContractSchema.safeParse(contract);
  if (!valid.success) {
    return {
      ok: false,
      status: 500,
      code: "INVALID_ANALYSIS",
      message: "We couldn't analyze this opportunity right now.",
    };
  }

  const explanation = await explainDecision(profile, contract);
  const timestamp = nowIso();
  const analysisId = createId("analysis");

  const analysis: Analysis = {
    id: analysisId,
    userId: profile.userId,
    opportunityId: opportunity.id,
    decision: contract.decision,
    fitScore: contract.fitScore,
    summary: contract.summary,
    nextAction: contract.nextAction,
    explanation,
    disclaimer: contract.disclaimer,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const requirementRows: RequirementResult[] = contract.requirements.map((item) => ({
    id: createId("req"),
    analysisId,
    key: item.key,
    requirementText: item.requirementText,
    status: item.status,
    evidence: item.evidence,
    reason: item.reason,
    critical: item.critical,
    category: item.key,
  }));

  const readiness = contract.readiness.map((item) => ({
    id: createId("ready"),
    analysisId,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  await mutateStore((current) => {
    current.analyses.push(analysis);
    current.requirementResults.push(...requirementRows);
    current.readinessItems.push(...readiness);
  });

  return {
    ok: true,
    detail: {
      ...analysis,
      opportunity,
      profile,
      requirements: requirementRows,
      readiness,
      gaps: contract.gaps,
    },
  };
}

export function toAnalysisDetail(
  analysis: Analysis,
  opportunity: Opportunity,
  profile: Profile,
  requirements: RequirementResult[],
  readiness: AnalysisDetail["readiness"],
): AnalysisDetail {
  return {
    ...analysis,
    opportunity,
    profile,
    requirements,
    readiness,
    gaps: requirements
      .filter((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN")
      .map((item) => ({
        requirement: item.requirementText,
        status: item.status,
        remediation: item.reason,
      })),
  };
}
