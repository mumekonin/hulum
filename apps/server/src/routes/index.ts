import { Router } from "express";
import { analysisRouter } from "../analysis/index.js";
import { opportunityRouter } from "../opportunities/index.js";
import { profileRouter } from "../profiles/index.js";
import { readinessRouter } from "../readiness/index.js";
import { voiceRouter } from "../voice/index.js";
import { healthRouter } from "./health.js";

export function createApiRouter(): Router {
  const router = Router();
  router.use("/health", healthRouter);
  router.use("/profile", profileRouter);
  router.use("/opportunities", opportunityRouter);
  router.use("/analyses", analysisRouter);
  router.use("/readiness", readinessRouter);
  router.use("/voice", voiceRouter);
  return router;
}
