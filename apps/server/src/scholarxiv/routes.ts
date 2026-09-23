import { Router } from "express";
import { ok } from "@hulum/shared";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { searchScholarxivPapers } from "./client.js";

export function createResearchRouter(): Router {
  const router = Router();

  router.get("/papers", async (req, res, next) => {
    try {
      const env = loadEnv();
      if (env.SCHOLARXIV_API_KEY === undefined) {
        throw new HttpError(
          503,
          "RESEARCH_UNAVAILABLE",
          "SCHOLARXIV_API_KEY must be set in the server environment.",
        );
      }
      const raw = typeof req.query.q === "string" ? req.query.q : "";
      const pageRaw = typeof req.query.page === "string" ? Number(req.query.page) : 0;
      const page = Number.isInteger(pageRaw) && pageRaw >= 0 ? pageRaw : 0;
      const result = await searchScholarxivPapers({
        apiKey: env.SCHOLARXIV_API_KEY,
        query: raw,
        page,
      });
      res.status(200).json(ok(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const researchRouter = createResearchRouter();
