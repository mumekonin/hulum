import { Router } from "express";
import { ok } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { createReadinessService, type ReadinessService } from "./service.js";
import { createPgReadinessStore } from "./store.js";
import { parsePatchReadinessRequest } from "./validate.js";

function defaultService(): ReadinessService {
  return createReadinessService(createPgReadinessStore());
}

export function createReadinessRouter(service?: ReadinessService): Router {
  const router = Router();
  const getService = (): ReadinessService => service ?? defaultService();

  router.patch("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (id === undefined || !isUuid(id)) {
        throw new HttpError(400, "INVALID_ID", "Readiness id must be a UUID.");
      }
      const input = parsePatchReadinessRequest(req.body);
      const item = await getService().updateStatus(id, input.status);
      res.status(200).json(ok(item));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const readinessRouter = createReadinessRouter();
export { buildReadinessItems } from "./build.js";
