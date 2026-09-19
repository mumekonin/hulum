import { Router } from "express";
import { ok } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { createOpportunityService } from "../opportunities/service.js";
import { createPgOpportunityStore } from "../opportunities/store.js";
import { createProfileService } from "../profiles/service.js";
import { createPgProfileStore } from "../profiles/store.js";
import { systemClock } from "../services/common/clock.js";
import { createAnalysisService, type AnalysisService } from "./service.js";
import { createPgAnalysisStore } from "./store.js";
import { parseAnalyzeRequest } from "./validate.js";

function defaultService(): AnalysisService {
  return createAnalysisService({
    profiles: createProfileService(createPgProfileStore()),
    opportunities: createOpportunityService(createPgOpportunityStore()),
    store: createPgAnalysisStore(),
    clock: systemClock,
  });
}

export function createAnalyzeRouter(service?: AnalysisService): Router {
  const router = Router();
  const getService = (): AnalysisService => service ?? defaultService();

  router.post("/:id/analyze", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (id === undefined || !isUuid(id)) {
        throw new HttpError(400, "INVALID_ID", "Opportunity id must be a UUID.");
      }
      const input = parseAnalyzeRequest(req.body);
      const analysis = await getService().analyze(id, input.userId);
      res.status(201).json(ok(analysis));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createAnalysisRouter(service?: AnalysisService): Router {
  const router = Router();
  const getService = (): AnalysisService => service ?? defaultService();

  router.get("/:id/readiness", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (id === undefined || !isUuid(id)) {
        throw new HttpError(400, "INVALID_ID", "Analysis id must be a UUID.");
      }
      const readiness = await getService().getReadiness(id);
      if (readiness === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Analysis not found.");
      }
      res.status(200).json(ok(readiness));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (id === undefined || !isUuid(id)) {
        throw new HttpError(400, "INVALID_ID", "Analysis id must be a UUID.");
      }
      const analysis = await getService().getById(id);
      if (analysis === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Analysis not found.");
      }
      res.status(200).json(ok(analysis));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const analyzeRouter = createAnalyzeRouter();
export const analysisRouter = createAnalysisRouter();
