import { Router } from "express";
import { ok } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { createOpportunityService, type OpportunityService } from "./service.js";
import { createPgOpportunityStore } from "./store.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function defaultService(): OpportunityService {
  return createOpportunityService(createPgOpportunityStore());
}

export function createOpportunityRouter(service?: OpportunityService): Router {
  const router = Router();
  const getService = (): OpportunityService => service ?? defaultService();

  router.get("/", async (_req, res, next) => {
    try {
      const opportunities = await getService().list();
      res.status(200).json(ok(opportunities));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (id === undefined || !UUID_PATTERN.test(id)) {
        throw new HttpError(400, "INVALID_ID", "Opportunity id must be a UUID.");
      }

      const opportunity = await getService().getById(id);
      if (opportunity === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
      }

      res.status(200).json(ok(opportunity));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const opportunityRouter = createOpportunityRouter();
