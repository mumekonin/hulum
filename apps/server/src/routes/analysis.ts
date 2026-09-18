import { Router } from "express";
import { analyzeRequestSchema, analysisContractSchema, type Analysis, type RequirementResult } from "@hulum/shared";
import { explainDecision } from "../ai/explain.js";
import { analyzeOpportunity } from "../decision/engine.js";
import { fail, ok } from "../lib/http.js";
import { createId, nowIso } from "../lib/id.js";
import { loadStore, mutateStore } from "../store/fileStore.js";

export const analysisRouter = Router();

analysisRouter.post("/opportunities/:id/analyze", async (req, res) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "userId is required to analyze an opportunity.", 422, "INVALID_REQUEST");
    return;
  }

  const store = await loadStore();
  const opportunity = store.opportunities.find((item) => item.id === req.params.id);
  if (!opportunity) {
    fail(res, "Opportunity not found.", 404, "OPPORTUNITY_NOT_FOUND");
    return;
  }

  const profile = store.profiles.find((item) => item.userId === parsed.data.userId);
  if (!profile) {
    fail(res, "Create a profile before asking HULUM to analyze.", 404, "PROFILE_NOT_FOUND");
    return;
  }

  const contract = analyzeOpportunity(profile, opportunity);
  const valid = analysisContractSchema.safeParse(contract);
  if (!valid.success) {
    fail(res, "We couldn't analyze this opportunity right now.", 500, "INVALID_ANALYSIS");
    return;
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

  ok(res, {
    ...analysis,
    opportunity,
    profile,
    requirements: requirementRows,
    readiness,
    gaps: contract.gaps,
  }, 201);
});

analysisRouter.get("/analyses/:id", async (req, res) => {
  const store = await loadStore();
  const analysis = store.analyses.find((item) => item.id === req.params.id);
  if (!analysis) {
    fail(res, "Analysis not found.", 404, "ANALYSIS_NOT_FOUND");
    return;
  }
  const opportunity = store.opportunities.find((item) => item.id === analysis.opportunityId);
  const profile = store.profiles.find((item) => item.userId === analysis.userId);
  if (!opportunity || !profile) {
    fail(res, "Analysis is missing related records.", 500, "ANALYSIS_ORPHAN");
    return;
  }

  ok(res, {
    ...analysis,
    opportunity,
    profile,
    requirements: store.requirementResults.filter((item) => item.analysisId === analysis.id),
    readiness: store.readinessItems.filter((item) => item.analysisId === analysis.id),
    gaps: store.requirementResults
      .filter((item) => item.analysisId === analysis.id && (item.status === "NOT_MET" || item.status === "UNCERTAIN"))
      .map((item) => ({
        requirement: item.requirementText,
        status: item.status,
        remediation: item.reason,
      })),
  });
});

analysisRouter.get("/analyses/:id/readiness", async (req, res) => {
  const store = await loadStore();
  const items = store.readinessItems.filter((item) => item.analysisId === req.params.id);
  if (items.length === 0 && !store.analyses.some((item) => item.id === req.params.id)) {
    fail(res, "Analysis not found.", 404, "ANALYSIS_NOT_FOUND");
    return;
  }
  ok(res, items);
});
