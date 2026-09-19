import { Router } from "express";
import { analyzeRequestSchema } from "@hulum/shared";
import { fail, ok } from "../lib/http.js";
import { loadStore } from "../store/fileStore.js";
import { runAnalysis, toAnalysisDetail } from "../analysis/runAnalysis.js";

export const analysisRouter = Router();

analysisRouter.post("/opportunities/:id/analyze", async (req, res) => {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "userId is required to analyze an opportunity.", 422, "INVALID_REQUEST");
    return;
  }

  const result = await runAnalysis(parsed.data.userId, req.params.id);
  if (!result.ok) {
    fail(res, result.message, result.status, result.code);
    return;
  }
  ok(res, result.detail, 201);
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

  ok(
    res,
    toAnalysisDetail(
      analysis,
      opportunity,
      profile,
      store.requirementResults.filter((item) => item.analysisId === analysis.id),
      store.readinessItems.filter((item) => item.analysisId === analysis.id),
    ),
  );
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
