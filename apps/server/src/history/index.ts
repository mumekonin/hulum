import { Router } from "express";
import { ok } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { requireSessionUserId } from "../security/session.js";
import { createPgHistoryStore, type HistoryStore } from "./store.js";

function opportunityIdFrom(value: unknown): string {
  if (typeof value !== "string" || !isUuid(value)) {
    throw new HttpError(400, "INVALID_ID", "Opportunity id must be a UUID.");
  }
  return value;
}

/** GET /api/analyses — the signed-in user's latest analysis per opportunity. */
export function createAnalysisListRouter(store?: HistoryStore): Router {
  const router = Router();
  const getStore = (): HistoryStore => store ?? createPgHistoryStore();

  router.get("/", async (req, res, next) => {
    try {
      const userId = requireSessionUserId(req);
      const filter = req.query.opportunityId;
      const opportunityId = filter === undefined ? undefined : opportunityIdFrom(filter);
      res.status(200).json(ok(await getStore().listLatestAnalyses(userId, opportunityId)));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

/** /api/saved — bookmarks scoped to the session user. */
export function createSavedRouter(store?: HistoryStore): Router {
  const router = Router();
  const getStore = (): HistoryStore => store ?? createPgHistoryStore();

  router.get("/", async (req, res, next) => {
    try {
      const userId = requireSessionUserId(req);
      res.status(200).json(ok(await getStore().listSaved(userId)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const userId = requireSessionUserId(req);
      const body: unknown = req.body;
      const raw = typeof body === "object" && body !== null ? (body as { opportunityId?: unknown }).opportunityId : undefined;
      const saved = await getStore().save(userId, opportunityIdFrom(raw));
      res.status(201).json(ok(saved));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:opportunityId", async (req, res, next) => {
    try {
      const userId = requireSessionUserId(req);
      const opportunityId = opportunityIdFrom(req.params.opportunityId);
      const removed = await getStore().unsave(userId, opportunityId);
      if (!removed) {
        throw new HttpError(404, "NOT_FOUND", "This opportunity is not saved.");
      }
      res.status(200).json(ok({ opportunityId }));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const analysisListRouter = createAnalysisListRouter();
export const savedRouter = createSavedRouter();
