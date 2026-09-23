import { Router } from "express";
import { ok } from "@hulum/shared";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { runInvestigation } from "./run.js";

export function createInvestigateRouter(): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const env = loadEnv({ fromFile: false });
      if (env.INVESTIGATE_ADMIN_SECRET === undefined) {
        throw new HttpError(
          503,
          "INVESTIGATE_UNAVAILABLE",
          "INVESTIGATE_ADMIN_SECRET must be set in the server environment.",
        );
      }
      const provided = req.header("x-hulum-investigate");
      if (provided !== env.INVESTIGATE_ADMIN_SECRET) {
        throw new HttpError(401, "UNAUTHORIZED", "Investigate secret does not match.");
      }
      const summary = await runInvestigation(env);
      res.status(200).json(ok(summary));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const investigateRouter = createInvestigateRouter();
