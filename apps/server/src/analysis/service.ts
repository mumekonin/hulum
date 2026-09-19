import type { Analysis, ProfileView, ReadinessItem } from "@hulum/shared";
import { decide } from "../decision/decide.js";
import { HttpError } from "../http/errors.js";
import type { OpportunityService } from "../opportunities/service.js";
import type { ProfileService } from "../profiles/service.js";
import { matchRequirements } from "../requirements/match.js";
import { buildReadinessItems } from "../readiness/build.js";
import type { Clock } from "../services/common/clock.js";
import type { AnalysisStore } from "./store.js";
import { ANALYSIS_SUMMARY } from "./summary.js";

export type AnalysisService = {
  analyze(opportunityId: string, userId: string): Promise<Analysis>;
  getById(id: string): Promise<Analysis | undefined>;
  getReadiness(id: string): Promise<ReadinessItem[] | undefined>;
};

export function createAnalysisService(deps: {
  profiles: Pick<ProfileService, "getByUserId">;
  opportunities: Pick<OpportunityService, "getById">;
  store: AnalysisStore;
  clock: Clock;
}): AnalysisService {
  return {
    async analyze(opportunityId: string, userId: string): Promise<Analysis> {
      const profileView: ProfileView | undefined = await deps.profiles.getByUserId(userId);
      if (profileView === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      const opportunity = await deps.opportunities.getById(opportunityId);
      if (opportunity === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
      }

      const result = decide(profileView.profile, opportunity, deps.clock);
      const matches = matchRequirements(profileView.profile, opportunity, deps.clock);
      return deps.store.create({
        userId,
        opportunityId,
        decision: result.decision,
        fitScore: result.fitScore,
        summary: ANALYSIS_SUMMARY[result.decision],
        matches,
        readiness: buildReadinessItems(matches),
      });
    },

    getById(id: string): Promise<Analysis | undefined> {
      return deps.store.getById(id);
    },

    async getReadiness(id: string): Promise<ReadinessItem[] | undefined> {
      const analysis = await deps.store.getById(id);
      if (analysis === undefined) {
        return undefined;
      }
      return analysis.readiness;
    },
  };
}
