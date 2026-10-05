import type {
  Analysis,
  AnalysisExplanation,
  Language,
  ProfileView,
  ReadinessItem,
  ReadinessPlan,
} from "@hulum/shared";
import {
  buildExplainMessages,
  buildReadinessPlanMessages,
  explanationFrom,
  readinessPlanFrom,
  type ChatClient,
} from "../ai/index.js";
import { isUnsafeExplanation } from "../ai/guard.js";
import { decide } from "../decision/decide.js";
import { HttpError } from "../http/errors.js";
import { recordOpsEvent, timeOps, timeOpsSync } from "../ops/metrics.js";
import type { OpportunityService } from "../opportunities/service.js";
import { profileForDecision } from "../profiles/documentContext.js";
import type { DocumentStore } from "../profiles/documents.js";
import type { ProfileService } from "../profiles/service.js";
import { buildReadinessItems } from "../readiness/build.js";
import type { Clock } from "../services/common/clock.js";
import type { AnalysisStore } from "./store.js";
import { analysisSummaryFor } from "./summary.js";

export type AnalysisService = {
  analyze(opportunityId: string, userId: string): Promise<Analysis>;
  getById(id: string): Promise<Analysis | undefined>;
  getReadiness(id: string): Promise<ReadinessItem[] | undefined>;
  explain(id: string, language: Language): Promise<AnalysisExplanation>;
  personalizedReadinessPlan(id: string, language: Language): Promise<ReadinessPlan>;
};

function httpCode(error: unknown): string | undefined {
  return error instanceof HttpError ? error.code : undefined;
}

async function completeWithOptionalRetry(
  chat: ChatClient,
  messages: Array<{ role: "system" | "user"; content: string }>,
  opsName: string,
): Promise<string> {
  try {
    return await timeOps("ai", opsName, () => chat.complete(messages), httpCode);
  } catch (error) {
    if (!(error instanceof HttpError) || error.code !== "AI_ERROR") {
      throw error;
    }
    try {
      return await timeOps("ai", `${opsName}.retry`, () => chat.complete(messages), httpCode);
    } catch (retryError) {
      if (!(retryError instanceof HttpError) || retryError.code !== "AI_ERROR") {
        throw retryError;
      }
      return "";
    }
  }
}

export function createAnalysisService(deps: {
  profiles: Pick<ProfileService, "getByUserId">;
  opportunities: Pick<OpportunityService, "getById">;
  store: AnalysisStore;
  clock: Clock;
  chat?: ChatClient;
  documents?: Pick<DocumentStore, "ensureExtracted" | "texts">;
}): AnalysisService {
  return {
    async analyze(opportunityId: string, userId: string): Promise<Analysis> {
      return timeOps(
        "decision",
        "analyze",
        async () => {
          const profileView: ProfileView | undefined = await deps.profiles.getByUserId(userId);
          if (profileView === undefined) {
            throw new HttpError(404, "NOT_FOUND", "Profile not found.");
          }
          const opportunity = await deps.opportunities.getById(opportunityId);
          if (opportunity === undefined) {
            throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
          }

          const profile =
            deps.documents === undefined
              ? profileView.profile
              : await profileForDecision(profileView.profile, deps.documents);

          const result = timeOpsSync("decision", "decide", () =>
            decide(profile, opportunity, deps.clock),
          );
          return deps.store.create({
            userId,
            opportunityId,
            decision: result.decision,
            fitScore: result.fitScore,
            summary: analysisSummaryFor(result.decision, result.matches),
            matches: result.matches,
            readiness: buildReadinessItems(result.matches),
            audit: result.audit,
          });
        },
        httpCode,
      );
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

    async explain(id: string, language: Language): Promise<AnalysisExplanation> {
      const analysis = await deps.store.getById(id);
      if (analysis === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Analysis not found.");
      }
      if (deps.chat === undefined) {
        throw new HttpError(
          503,
          "AI_UNAVAILABLE",
          "GROQ_API_KEY and GROQ_MODEL must be set in the server environment.",
        );
      }
      // One AI_ERROR retry via shared helper; guards still replace unsafe text.
      const text = await completeWithOptionalRetry(
        deps.chat,
        buildExplainMessages(analysis, language),
        "explain.groq",
      );
      if (isUnsafeExplanation(analysis, text)) {
        recordOpsEvent({
          kind: "ai_validation",
          name: "explain.unsafe_fallback",
          ok: false,
          ms: 0,
          code: "AI_UNSAFE_OUTPUT",
        });
      }
      return explanationFrom(analysis, language, text);
    },

    async personalizedReadinessPlan(id: string, language: Language): Promise<ReadinessPlan> {
      const analysis = await deps.store.getById(id);
      if (analysis === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Analysis not found.");
      }
      if (deps.chat === undefined) {
        throw new HttpError(
          503,
          "AI_UNAVAILABLE",
          "GROQ_API_KEY and GROQ_MODEL must be set in the server environment.",
        );
      }
      const text = await completeWithOptionalRetry(
        deps.chat,
        buildReadinessPlanMessages(analysis, language),
        "readiness.plan.groq",
      );
      return readinessPlanFrom(analysis, language, text);
    },
  };
}
