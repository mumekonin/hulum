import { Router } from "express";
import { analysisRouter, analyzeRouter } from "../analysis/index.js";
import { profileExtractRouter } from "../ai/profileExtractRouter.js";
import { screenshotRouter } from "../ai/screenshotRouter.js";
import { authRouter } from "../auth/routes.js";
import { createOpsRouter } from "../ops/index.js";
import { opportunityRouter } from "../opportunities/index.js";
import { profileRouter } from "../profiles/index.js";
import { readinessRouter } from "../readiness/index.js";
import { voiceRouter } from "../voice/index.js";
import { investigateRouter } from "../investigator/routes.js";
import { researchRouter } from "../scholarxiv/routes.js";
import { healthRouter } from "./health.js";

export function createApiRouter(): Router {
  const router = Router();
  router.use("/health", healthRouter);
  router.use("/ops", createOpsRouter("postgres"));
  router.use("/auth", authRouter);
  router.use("/investigate", investigateRouter);
  router.use("/research", researchRouter);
  router.use("/profile", profileRouter);
  router.use("/ai", profileExtractRouter);
  router.use("/ai", screenshotRouter);
  router.use("/opportunities", analyzeRouter);
  router.use("/opportunities", opportunityRouter);
  router.use("/analyses", analysisRouter);
  router.use("/readiness", readinessRouter);
  router.use("/voice", voiceRouter);
  return router;
}
