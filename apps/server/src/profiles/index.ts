import { Router } from "express";
import { ok } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { assertRequestSession } from "../security/session.js";
import { createProfileService, type ProfileService } from "./service.js";
import { createPgProfileStore } from "./store.js";
import { parseCreateProfileRequest, parsePatchProfileRequest } from "./validate.js";

function defaultService(): ProfileService {
  return createProfileService(createPgProfileStore());
}

export function createProfileRouter(service?: ProfileService): Router {
  const router = Router();
  const getService = (): ProfileService => service ?? defaultService();

  router.post("/", async (req, res, next) => {
    try {
      const input = parseCreateProfileRequest(req.body);
      const view = await getService().create(input);
      res.status(201).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  /** Abeba Tesfaye demo persona for local/API backup demos (idempotent by email). */
  router.post("/demo", async (_req, res, next) => {
    try {
      const view = await getService().ensureDemo();
      res.status(201).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:userId", async (req, res, next) => {
    try {
      const userId = req.params.userId;
      if (userId === undefined || !isUuid(userId)) {
        throw new HttpError(400, "INVALID_ID", "User id must be a UUID.");
      }
      assertRequestSession(req, userId);
      const view = await getService().getByUserId(userId);
      if (view === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      res.status(200).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:userId", async (req, res, next) => {
    try {
      const userId = req.params.userId;
      if (userId === undefined || !isUuid(userId)) {
        throw new HttpError(400, "INVALID_ID", "User id must be a UUID.");
      }
      assertRequestSession(req, userId);
      const patch = parsePatchProfileRequest(req.body);
      const view = await getService().update(userId, patch);
      if (view === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      res.status(200).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const profileRouter = createProfileRouter();
