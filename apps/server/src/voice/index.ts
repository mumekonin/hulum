import { randomUUID } from "node:crypto";
import {
  RequirementStatus,
  profileCompleteness,
  voiceActionSchema,
  type Analysis,
  type AnalysisDetail,
  type LanguageCode,
  type Opportunity,
  type Profile,
  type RequirementResult,
  type VoiceActionResponse,
  type VoiceIntent,
  ok,
} from "@hulum/shared";
import { Router } from "express";
import type { AnalysisService } from "../analysis/service.js";
import { createAnalysisService } from "../analysis/service.js";
import { createPgAnalysisStore } from "../analysis/store.js";
import { createGroqChatClient, type ChatClient } from "../ai/index.js";
import { loadEnv } from "../config/env.js";
import { decide } from "../decision/decide.js";
import { getPool } from "../db/pool.js";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { createOpportunityService, type OpportunityService } from "../opportunities/service.js";
import { createPgOpportunityStore } from "../opportunities/store.js";
import { recordOpsEvent, timeOps } from "../ops/metrics.js";
import { createProfileService, type ProfileService } from "../profiles/service.js";
import { createPgProfileStore } from "../profiles/store.js";
import type { Clock } from "../services/common/clock.js";
import { systemClock } from "../services/common/clock.js";
import { formatOpportunityContext, formatOpportunityList, formatProfileGaps, parseVoiceIntent } from "./intents.js";

export type VoiceSessionView = {
  id: string;
  userId: string;
  language: LanguageCode;
  startedAt: string;
  endedAt: string | null;
  provider: "text-fallback" | "voxide";
};

export type VoiceService = {
  createSession(userId: string, language: LanguageCode): Promise<VoiceSessionView>;
  handleAction(input: {
    userId: string;
    text: string;
    language: LanguageCode;
    opportunityId?: string;
    analysisId?: string;
  }): Promise<VoiceActionResponse>;
};

function optionalChat(): ChatClient | undefined {
  const env = loadEnv();
  if (env.GROQ_API_KEY === undefined || env.GROQ_MODEL === undefined) {
    return undefined;
  }
  return createGroqChatClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL });
}

function toRequirementResults(analysis: Analysis): RequirementResult[] {
  return (analysis.requirements ?? []).map((row) => ({
    id: row.id,
    analysisId: row.analysisId,
    key: row.key,
    requirementText: row.text,
    status: row.status,
    evidence: row.evidence ?? "",
    reason: row.reason ?? "",
    critical: false,
    category: row.key,
  }));
}

function toAnalysisDetail(
  analysis: Analysis,
  opportunity: Opportunity,
  profile: Profile,
): AnalysisDetail {
  const requirements = toRequirementResults(analysis);
  const readiness = analysis.readiness ?? [];
  return {
    ...analysis,
    opportunity,
    profile,
    requirements,
    readiness,
    gaps: requirements
      .filter(
        (item) =>
          item.status === RequirementStatus.NOT_MET || item.status === RequirementStatus.UNCERTAIN,
      )
      .map((item) => ({
        requirement: item.requirementText,
        status: item.status,
        remediation: item.reason,
      })),
  };
}

export function createVoiceService(deps: {
  profiles: Pick<ProfileService, "getByUserId">;
  opportunities: Pick<OpportunityService, "list" | "getById">;
  analyses: Pick<AnalysisService, "analyze" | "getById">;
  clock?: Clock;
  persistSession?: (input: { id: string; userId: string; language: LanguageCode }) => Promise<void>;
}): VoiceService {
  const clock = deps.clock ?? systemClock;

  return {
    async createSession(userId, language) {
      return timeOps("session", "voice.session", async () => {
        const id = randomUUID();
        const startedAt = clock.now().toISOString();
        if (isUuid(userId) && deps.persistSession) {
          try {
            await deps.persistSession({ id, userId, language });
          } catch {
            recordOpsEvent({
              kind: "session",
              name: "voice.session.persist",
              ok: false,
              ms: 0,
              code: "SESSION_PERSIST_FAILED",
            });
            // Session metadata is best-effort; text actions still work without it.
          }
        }
        return {
          id,
          userId,
          language,
          startedAt,
          endedAt: null,
          // Browser Voxide uses a publishable web key. Server leftover VOXIDE_API_KEY is not the widget path.
          provider: "text-fallback" as const,
        };
      });
    },

    async handleAction(input) {
      return timeOps(
        "voice",
        "voice.action",
        async () => {
      const language = input.language;
      const intent = parseVoiceIntent(input.text, language);
      const opportunities = await deps.opportunities.list();
      const analysis = input.analysisId ? await deps.analyses.getById(input.analysisId) : undefined;
      const opportunity = input.opportunityId
        ? await deps.opportunities.getById(input.opportunityId)
        : analysis
          ? await deps.opportunities.getById(analysis.opportunityId)
          : undefined;

      if (intent.intent === "SHOW_OPPORTUNITIES") {
        return {
          intent: intent.intent,
          reply: `Here are current opportunities: ${formatOpportunityList(opportunities)}`,
          opportunities,
        };
      }

      if (intent.intent === "FILTER_OPPORTUNITIES") {
        const filtered = intent.type
          ? opportunities.filter((item) => item.type === intent.type)
          : opportunities;
        return {
          intent: intent.intent,
          reply: filtered.length
            ? `Filtered to ${intent.type}: ${formatOpportunityList(filtered)}`
            : "No opportunities matched that filter.",
          opportunities: filtered,
        };
      }

      if (intent.intent === "FILTER_BY_DECISION") {
        const decision = intent.decision;
        if (!decision) {
          return {
            intent: intent.intent,
            reply: "Say APPLY, MAYBE, or SKIP when filtering opportunities by decision.",
          };
        }
        const profileView = await deps.profiles.getByUserId(input.userId);
        if (profileView === undefined) {
          throw new HttpError(
            404,
            "PROFILE_NOT_FOUND",
            "Create a profile before asking HULUM to analyze.",
          );
        }
        const filtered = opportunities.filter(
          (item) => decide(profileView.profile, item, clock).decision === decision,
        );
        return {
          intent: intent.intent,
          reply: filtered.length
            ? `${decision} opportunities: ${formatOpportunityList(filtered)}`
            : `No ${decision} opportunities for your profile.`,
          opportunities: filtered,
        };
      }

      if (intent.intent === "OPEN_OPPORTUNITY") {
        if (!opportunity) {
          return {
            intent: intent.intent,
            reply:
              "Choose an opportunity first, then I can tell you about it from the stored record.",
          };
        }
        const storedDecision =
          analysis && analysis.opportunityId === opportunity.id ? analysis.decision : undefined;
        return {
          intent: intent.intent,
          reply: formatOpportunityContext(opportunity, storedDecision),
          opportunity,
        };
      }

      if (intent.intent === "UPDATE_PROFILE") {
        if (intent.replyHint === "profile_gaps") {
          const profileView = await deps.profiles.getByUserId(input.userId);
          if (profileView === undefined) {
            throw new HttpError(404, "PROFILE_NOT_FOUND", "Create a profile before asking HULUM.");
          }
          const gaps = profileCompleteness(profileView.profile);
          return {
            intent: intent.intent,
            reply: formatProfileGaps(gaps.missing),
          };
        }
        return {
          intent: intent.intent,
          reply:
            "Open your profile to update education, skills, or documents. Voice cannot silently change stored facts.",
        };
      }

      if (intent.intent === "ANALYZE_OPPORTUNITY") {
        if (!opportunity) {
          return {
            intent: intent.intent,
            reply: "Choose an opportunity first, then ask whether you should apply.",
          };
        }
        try {
          const created = await deps.analyses.analyze(opportunity.id, input.userId);
          const profileView = await deps.profiles.getByUserId(input.userId);
          if (profileView === undefined) {
            throw new HttpError(
              404,
              "PROFILE_NOT_FOUND",
              "Create a profile before asking HULUM to analyze.",
            );
          }
          const detail = toAnalysisDetail(created, opportunity, profileView.profile);
          return {
            intent: intent.intent,
            reply: `${detail.decision} for ${opportunity.title}. Fit ${detail.fitScore}%. ${detail.nextAction}`,
            analysis: detail,
            opportunity,
          };
        } catch (error) {
          if (error instanceof HttpError && error.code === "PROFILE_NOT_FOUND") {
            throw error;
          }
          if (error instanceof HttpError) {
            return {
              intent: intent.intent,
              reply: error.message,
              opportunity,
            };
          }
          throw error;
        }
      }

      if (analysis) {
        const relatedOpportunity =
          opportunity ?? (await deps.opportunities.getById(analysis.opportunityId));
        const profileView = await deps.profiles.getByUserId(analysis.userId);
        const requirements = analysis.requirements ?? [];
        const readiness = analysis.readiness ?? [];
        const gaps = requirements
          .filter(
            (item) =>
              item.status === RequirementStatus.NOT_MET ||
              item.status === RequirementStatus.UNCERTAIN,
          )
          .map((item) => `${item.text} (${item.status})`);
        const detail =
          relatedOpportunity && profileView
            ? toAnalysisDetail(analysis, relatedOpportunity, profileView.profile)
            : undefined;

        if (intent.intent === "EXPLAIN_DECISION") {
          return {
            intent: intent.intent,
            reply: `${analysis.decision}. ${analysis.summary}`,
            analysis: detail,
            opportunity: relatedOpportunity,
          };
        }
        if (intent.intent === "SHOW_MISSING_REQUIREMENTS") {
          const uncertainOnly = requirements
            .filter((item) => item.status === RequirementStatus.UNCERTAIN)
            .map((item) => `${item.text} (${item.reason ?? "needs verification"})`);
          if (intent.replyHint === "clarify_uncertain") {
            return {
              intent: intent.intent,
              reply: uncertainOnly.length
                ? `These requirements are UNCERTAIN — confirm them on the official source before treating them as met: ${uncertainOnly.join("; ")}`
                : "No UNCERTAIN requirements are stored for this analysis. Confirm any doubt on the official source; HULUM is not the organization.",
              analysis: detail,
              opportunity: relatedOpportunity,
            };
          }
          return {
            intent: intent.intent,
            reply: gaps.length
              ? `Missing or uncertain: ${gaps.join("; ")}`
              : "No missing or uncertain requirements are stored for this analysis.",
            analysis: detail,
            opportunity: relatedOpportunity,
          };
        }
        if (intent.intent === "SHOW_READINESS") {
          const list = readiness.length
            ? readiness.map((item) => `${item.title} (${item.status.replace("_", " ")})`).join("; ")
            : "No readiness checklist is stored yet.";
          return {
            intent: intent.intent,
            reply: readiness.length
              ? `${analysis.nextAction} Prepare: ${list}`
              : `${analysis.nextAction} ${list}`,
            analysis: detail,
            opportunity: relatedOpportunity,
          };
        }
      }

      if (
        intent.intent === "EXPLAIN_DECISION" ||
        intent.intent === "SHOW_MISSING_REQUIREMENTS" ||
        intent.intent === "SHOW_READINESS"
      ) {
        return {
          intent: intent.intent,
          reply:
            "Analyze an opportunity first, then I can explain the decision, gaps, or readiness plan.",
        };
      }

      return {
        intent: "UNSUPPORTED" as VoiceIntent,
        reply:
          "I can show opportunities, filter internships or scholarships, filter APPLY MAYBE or SKIP, analyze a selected opportunity, explain a decision, or list what to prepare. You can also type instead of speaking.",
      };
        },
        (error) => (error instanceof HttpError ? error.code : undefined),
      );
    },
  };
}

async function persistVoiceSession(input: {
  id: string;
  userId: string;
  language: LanguageCode;
}): Promise<void> {
  await getPool().query(`insert into voice_sessions (id, user_id, language) values ($1, $2, $3)`, [
    input.id,
    input.userId,
    input.language,
  ]);
}

function defaultVoiceService(): VoiceService {
  const chat = optionalChat();
  const profiles = createProfileService(createPgProfileStore());
  const opportunities = createOpportunityService(createPgOpportunityStore(), systemClock);
  const analyses = createAnalysisService({
    profiles,
    opportunities,
    store: createPgAnalysisStore(),
    clock: systemClock,
    ...(chat === undefined ? {} : { chat }),
  });
  return createVoiceService({
    profiles,
    opportunities,
    analyses,
    clock: systemClock,
    persistSession: persistVoiceSession,
  });
}

/**
 * Postgres Ask HULUM text/quick-action path. Voxide browser widget calls these same endpoints.
 */
export function createVoiceRouter(service?: VoiceService): Router {
  const router = Router();
  const getService = (): VoiceService => service ?? defaultVoiceService();

  router.post("/session", async (req, res, next) => {
    try {
      const userId =
        typeof req.body?.userId === "string" && req.body.userId.trim()
          ? req.body.userId.trim()
          : "anonymous";
      const language: LanguageCode =
        req.body?.language === "am" || req.body?.language === "om" ? req.body.language : "en";
      const session = await getService().createSession(userId, language);
      res.status(201).json(ok(session));
    } catch (error) {
      next(error);
    }
  });

  router.post("/action", async (req, res, next) => {
    try {
      const parsed = voiceActionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(422, "INVALID_VOICE", "Voice action needs text and a user id.");
      }
      const { text, language = "en", userId, opportunityId, analysisId } = parsed.data;
      const result = await getService().handleAction({
        userId,
        text,
        language,
        ...(opportunityId === undefined ? {} : { opportunityId }),
        ...(analysisId === undefined ? {} : { analysisId }),
      });
      res.status(200).json(ok(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const voiceRouter = createVoiceRouter();
