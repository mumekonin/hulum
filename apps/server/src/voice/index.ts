import { randomUUID } from "node:crypto";
import { Router } from "express";
import {
  RequirementStatus,
  detectAskedLanguage,
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
import { createGroqChatClient, type ChatClient } from "../ai/index.js";
import {
  formatProfileExtractReply,
  proposeProfileExtract,
} from "../ai/profileExtract.js";
import { createAnalysisService } from "../analysis/service.js";
import type { AnalysisService } from "../analysis/service.js";
import { createPgAnalysisStore } from "../analysis/store.js";
import { loadEnv } from "../config/env.js";
import { decide } from "../decision/decide.js";
import { getPool } from "../db/pool.js";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { assertRequestSession } from "../security/session.js";
import { createOpportunityService, type OpportunityService } from "../opportunities/service.js";
import { createPgOpportunityStore } from "../opportunities/store.js";
import { timeOps } from "../ops/metrics.js";
import { createProfileService, type ProfileService } from "../profiles/service.js";
import { createPgProfileStore } from "../profiles/store.js";
import type { Clock } from "../services/common/clock.js";
import { systemClock } from "../services/common/clock.js";
import {
  formatProfileGaps,
  parseVoiceIntent,
  stripProfileExtractDescription,
  wantsListWithAnalyze,
} from "./intents.js";
import {
  replyAnalysis,
  replyDecisionFilter,
  replyDetails,
  replyExplain,
  replyGaps,
  replyListThenAnalysis,
  replyNeedAnalysis,
  replyNeedDecisionWord,
  replyNeedOpportunity,
  replyNeedProfile,
  replyOpportunityList,
  replyReadiness,
  replyUnsupported,
} from "./replies.js";
import { speakInAskedLanguage } from "./speak.js";

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

function toAnalysisDetail(analysis: Analysis, opportunity: Opportunity, profile: Profile): AnalysisDetail {
  const requirements = toRequirementResults(analysis);
  const readiness = analysis.readiness ?? [];
  return {
    ...analysis,
    opportunity,
    profile,
    requirements,
    readiness,
    gaps: requirements
      .filter((item) => item.status === RequirementStatus.NOT_MET || item.status === RequirementStatus.UNCERTAIN)
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
  chat?: ChatClient;
  persistSession?: (input: { id: string; userId: string; language: LanguageCode }) => Promise<void>;
}): VoiceService {
  const clock = deps.clock ?? systemClock;

  return {
    async createSession(userId, language) {
      const id = randomUUID();
      const startedAt = clock.now().toISOString();
      if (isUuid(userId) && deps.persistSession) {
        try {
          await deps.persistSession({ id, userId, language });
        } catch {
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
        provider: "text-fallback",
      };
    },

    async handleAction(input) {
      const language = detectAskedLanguage(input.text, input.language);
      const spoken = (reply: string) => speakInAskedLanguage(deps.chat, language, reply);
      const intent = parseVoiceIntent(input.text, language);
      const opportunities = await deps.opportunities.list();
      const analysis = input.analysisId
        ? await deps.analyses.getById(input.analysisId)
        : undefined;
      const analyzePool =
        intent.type !== undefined ? opportunities.filter((item) => item.type === intent.type) : opportunities;
      let opportunity = input.opportunityId
        ? await deps.opportunities.getById(input.opportunityId)
        : analysis
          ? await deps.opportunities.getById(analysis.opportunityId)
          : undefined;
      if (opportunity === undefined && intent.intent === "ANALYZE_OPPORTUNITY") {
        opportunity = analyzePool[0];
      }

      if (intent.intent === "SHOW_OPPORTUNITIES") {
        return {
          intent: intent.intent,
          reply: await spoken(replyOpportunityList(language, opportunities)),
          opportunities,
        };
      }

      if (intent.intent === "FILTER_OPPORTUNITIES") {
        const filtered = intent.type ? opportunities.filter((item) => item.type === intent.type) : opportunities;
        return {
          intent: intent.intent,
          reply: await spoken(replyOpportunityList(language, filtered, intent.type)),
          opportunities: filtered,
        };
      }

      if (intent.intent === "FILTER_BY_DECISION") {
        const decision = intent.decision;
        if (!decision) {
          return {
            intent: intent.intent,
            reply: await spoken(replyNeedDecisionWord(language)),
          };
        }
        const profileView = await deps.profiles.getByUserId(input.userId);
        if (profileView === undefined) {
          throw new HttpError(404, "PROFILE_NOT_FOUND", "Create a profile before asking HULUM to analyze.");
        }
        const filtered = opportunities.filter(
          (item) => decide(profileView.profile, item, clock).decision === decision,
        );
        return {
          intent: intent.intent,
          reply: await spoken(replyDecisionFilter(language, decision, filtered)),
          opportunities: filtered,
        };
      }

      if (intent.intent === "OPEN_OPPORTUNITY") {
        if (!opportunity) {
          return {
            intent: intent.intent,
            reply: await spoken(replyNeedOpportunity(language)),
          };
        }
        const storedDecision =
          analysis && analysis.opportunityId === opportunity.id ? analysis.decision : undefined;
        return {
          intent: intent.intent,
          reply: await spoken(replyDetails(language, opportunity, storedDecision)),
          opportunity,
        };
      }

      if (intent.intent === "UPDATE_PROFILE") {
        if (intent.replyHint === "profile_gaps") {
          const profileView = await deps.profiles.getByUserId(input.userId);
          if (profileView === undefined) {
            return {
              intent: intent.intent,
              reply: await spoken(replyNeedProfile(language)),
            };
          }
          const missing = profileView.completeness?.missing ?? [];
          return {
            intent: intent.intent,
            reply: await spoken(formatProfileGaps(missing)),
          };
        }
        if (intent.replyHint === "profile_extract") {
          const description = stripProfileExtractDescription(input.text);
          if (description.length < 8) {
            return {
              intent: intent.intent,
              reply:
                "Paste a short self-description after the request, or open Profile and use Propose profile fields. Nothing is saved until you confirm.",
            };
          }
          const proposed = await proposeProfileExtract(description, deps.chat);
          return {
            intent: intent.intent,
            reply: formatProfileExtractReply(proposed),
          };
        }
        return {
          intent: intent.intent,
          reply:
            "Open your profile to update education, skills, or documents. To propose fields from speech or text, say “Extract profile from this: …” — confirm on Profile before save. Voice cannot silently change stored facts.",
        };
      }

      if (intent.intent === "ANALYZE_OPPORTUNITY") {
        if (!opportunity) {
          return {
            intent: intent.intent,
            reply: await spoken(replyNeedOpportunity(language)),
          };
        }
        try {
          const created = await deps.analyses.analyze(opportunity.id, input.userId);
          const profileView = await deps.profiles.getByUserId(input.userId);
          if (profileView === undefined) {
            throw new HttpError(404, "PROFILE_NOT_FOUND", "Create a profile before asking HULUM to analyze.");
          }
          const detail = toAnalysisDetail(created, opportunity, profileView.profile);
          const includeList = wantsListWithAnalyze(input.text);
          const gaps = detail.gaps.map((item) => `${item.requirement} (${item.status})`);
          const extra = {
            summary: detail.summary,
            gaps,
            sourceUrl: opportunity.sourceUrl,
          };
          const reply = includeList
            ? replyListThenAnalysis(
                language,
                analyzePool,
                intent.type,
                opportunity.title,
                detail.decision,
                detail.fitScore,
                detail.nextAction,
                extra,
              )
            : replyAnalysis(
                language,
                opportunity.title,
                detail.decision,
                detail.fitScore,
                detail.nextAction,
                extra,
              );
          return {
            intent: intent.intent,
            reply: await spoken(reply),
            analysis: detail,
            opportunity,
            ...(includeList ? { opportunities: analyzePool } : {}),
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
          .filter((item) => item.status === RequirementStatus.NOT_MET || item.status === RequirementStatus.UNCERTAIN)
          .map((item) => `${item.text} (${item.status})`);
        const detail =
          relatedOpportunity && profileView
            ? toAnalysisDetail(analysis, relatedOpportunity, profileView.profile)
            : undefined;

        if (intent.intent === "EXPLAIN_DECISION") {
          return {
            intent: intent.intent,
            reply: await spoken(replyExplain(language, analysis.decision, analysis.summary)),
            analysis: detail,
            opportunity: relatedOpportunity,
          };
        }
        if (intent.intent === "SHOW_MISSING_REQUIREMENTS") {
          return {
            intent: intent.intent,
            reply: await spoken(replyGaps(language, gaps)),
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
            reply: await spoken(replyReadiness(language, analysis.nextAction, list)),
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
          reply: await spoken(replyNeedAnalysis(language)),
        };
      }

      return {
        intent: "UNSUPPORTED" as VoiceIntent,
        reply: await spoken(replyUnsupported(language)),
      };
    },
  };
}

async function persistVoiceSession(input: {
  id: string;
  userId: string;
  language: LanguageCode;
}): Promise<void> {
  await getPool().query(
    `insert into voice_sessions (id, user_id, language) values ($1, $2, $3)`,
    [input.id, input.userId, input.language],
  );
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
    ...(chat === undefined ? {} : { chat }),
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
        typeof req.body?.userId === "string" && req.body.userId.trim() ? req.body.userId.trim() : "anonymous";
      if (userId !== "anonymous") {
        assertRequestSession(req, userId);
      }
      const language: LanguageCode =
        req.body?.language === "am" || req.body?.language === "om" ? req.body.language : "en";
      const session = await timeOps("session", "voice.session", () =>
        getService().createSession(userId, language),
      );
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
      assertRequestSession(req, userId);
      const result = await timeOps(
        "voice",
        "voice.action",
        () =>
          getService().handleAction({
            userId,
            text,
            language,
            ...(opportunityId === undefined ? {} : { opportunityId }),
            ...(analysisId === undefined ? {} : { analysisId }),
          }),
        (error) =>
          error instanceof HttpError
            ? error.code
            : error && typeof error === "object" && "code" in error && typeof error.code === "string"
              ? error.code
              : undefined,
      );
      res.status(200).json(ok(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const voiceRouter = createVoiceRouter();
