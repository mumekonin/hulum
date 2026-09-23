import { Router } from "express";
import { ok as sharedOk } from "@hulum/shared";
import { decide } from "../decision/decide.js";
import { HttpError } from "../http/errors.js";
import { fail as fileFail, ok as fileOk } from "../lib/http.js";
import { createOpportunityService } from "../opportunities/service.js";
import { createPgOpportunityStore } from "../opportunities/store.js";
import { createProfileService } from "../profiles/service.js";
import { createPgProfileStore } from "../profiles/store.js";
import { systemClock } from "../services/common/clock.js";
import { loadStore } from "../store/fileStore.js";
import { opsSummary, timeOpsSync } from "./metrics.js";

/**
 * Local observability + decision debug.
 * Aggregates never include profile text, transcripts, or secrets.
 */
export function createOpsRouter(mode: "file" | "postgres" = "file"): Router {
  const router = Router();

  router.get("/summary", (_req, res) => {
    const summary = opsSummary();
    if (mode === "postgres") {
      res.status(200).json(sharedOk(summary));
      return;
    }
    fileOk(res, summary);
  });

  router.post("/decision-debug", async (req, res, next) => {
    try {
      const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
      const opportunityId =
        typeof req.body?.opportunityId === "string" ? req.body.opportunityId.trim() : "";
      if (!userId || !opportunityId) {
        if (mode === "postgres") {
          throw new HttpError(422, "INVALID_INPUT", "userId and opportunityId are required.");
        }
        fileFail(res, "userId and opportunityId are required.", 422, "INVALID_INPUT");
        return;
      }

      if (mode === "file") {
        const store = await loadStore();
        const profile = store.profiles.find((item) => item.userId === userId);
        const opportunity = store.opportunities.find((item) => item.id === opportunityId);
        if (!profile) {
          fileFail(res, "Profile not found.", 404, "PROFILE_NOT_FOUND");
          return;
        }
        if (!opportunity) {
          fileFail(res, "Opportunity not found.", 404, "OPPORTUNITY_NOT_FOUND");
          return;
        }
        const result = timeOpsSync("decision", "decide", () =>
          decide(profile, opportunity, systemClock),
        );
        fileOk(res, {
          decision: result.decision,
          fitScore: result.fitScore,
          nextAction: result.nextAction,
          reasons: result.reasons,
        });
        return;
      }

      const profiles = createProfileService(createPgProfileStore());
      const opportunities = createOpportunityService(createPgOpportunityStore(), systemClock);
      const profileView = await profiles.getByUserId(userId);
      if (profileView === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      const opportunity = await opportunities.getById(opportunityId);
      if (opportunity === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
      }
      const result = timeOpsSync("decision", "decide", () =>
        decide(profileView.profile, opportunity, systemClock),
      );
      res.status(200).json(
        sharedOk({
          decision: result.decision,
          fitScore: result.fitScore,
          nextAction: result.nextAction,
          reasons: result.reasons,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}
