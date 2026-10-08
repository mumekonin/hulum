import { Router } from "express";
import { detectAskedLanguage, profileCompleteness, voiceActionSchema } from "@hulum/shared";
import { runAnalysis, toAnalysisDetail } from "../analysis/runAnalysis.js";
import { analyzeOpportunity } from "../decision/engine.js";
import { fail, ok } from "../lib/http.js";
import { createId, nowIso } from "../lib/id.js";
import { formatProfileExtractReply, proposeProfileExtract } from "../ai/profileExtract.js";
import { createGroqChatClient } from "../ai/groq.js";
import { loadEnv } from "../config/env.js";
import {
  formatProfileGaps,
  formatProfileSummary,
  parseVoiceIntent,
  stripProfileExtractDescription,
  wantsListWithAnalyze,
} from "../voice/intents.js";
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
  replyOpportunityList,
  replyReadiness,
  replyUnsupported,
} from "../voice/replies.js";
import { speakInAskedLanguage } from "../voice/speak.js";
import { findLatestAnalysis } from "../voice/findAnalysis.js";
import { loadStore, mutateStore } from "../store/fileStore.js";

export const voiceRouter = Router();

voiceRouter.post("/session", async (req, res) => {
  const userId = typeof req.body?.userId === "string" && req.body.userId.trim() ? req.body.userId.trim() : "anonymous";
  const language = req.body?.language === "am" || req.body?.language === "om" ? req.body.language : "en";
  const session = {
    id: createId("voice"),
    userId,
    language,
    startedAt: nowIso(),
    endedAt: null as string | null,
  };
  await mutateStore((store) => {
    store.voiceSessions.push(session);
  });
  ok(
    res,
    {
      ...session,
      provider: "text-fallback",
    },
    201,
  );
});

voiceRouter.post("/action", async (req, res) => {
  const parsed = voiceActionSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "Voice action needs text and a user id.", 422, "INVALID_VOICE");
    return;
  }

  const store = await loadStore();
  const { text, language: requestedLanguage = "en", userId, opportunityId, analysisId } = parsed.data;
  const language = detectAskedLanguage(text, requestedLanguage);
  const env = loadEnv({ fromFile: false });
  const chat =
    env.GROQ_API_KEY !== undefined && env.GROQ_MODEL !== undefined
      ? createGroqChatClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL })
      : undefined;
  const spoken = (reply: string) => speakInAskedLanguage(chat, language, reply);
  const intent = parseVoiceIntent(text, language);
  const opportunities = store.opportunities;
  const analysis = findLatestAnalysis(store, { analysisId, userId, opportunityId });
  const analyzePool =
    intent.type !== undefined ? opportunities.filter((item) => item.type === intent.type) : opportunities;
  let opportunity = opportunityId
    ? opportunities.find((item) => item.id === opportunityId)
    : analysis
      ? opportunities.find((item) => item.id === analysis.opportunityId)
      : undefined;
  if (opportunity === undefined && intent.intent === "ANALYZE_OPPORTUNITY") {
    opportunity = analyzePool[0];
  }

  if (intent.intent === "SHOW_OPPORTUNITIES") {
    ok(res, {
      intent: intent.intent,
      reply: await spoken(replyOpportunityList(language, opportunities)),
      opportunities,
    });
    return;
  }

  if (intent.intent === "FILTER_OPPORTUNITIES") {
    const filtered = intent.type ? opportunities.filter((item) => item.type === intent.type) : opportunities;
    ok(res, {
      intent: intent.intent,
      reply: await spoken(replyOpportunityList(language, filtered, intent.type)),
      opportunities: filtered,
    });
    return;
  }

  if (intent.intent === "FILTER_BY_DECISION") {
    const decision = intent.decision;
    if (!decision) {
      ok(res, {
        intent: intent.intent,
        reply: await spoken(replyNeedDecisionWord(language)),
      });
      return;
    }
    const profile = store.profiles.find((item) => item.userId === userId);
    if (!profile) {
      fail(res, "Create a profile before asking HULUM to analyze.", 404, "PROFILE_NOT_FOUND");
      return;
    }
    const filtered = opportunities.filter((item) => analyzeOpportunity(profile, item).decision === decision);
    ok(res, {
      intent: intent.intent,
      reply: await spoken(replyDecisionFilter(language, decision, filtered)),
      opportunities: filtered,
    });
    return;
  }

  if (intent.intent === "OPEN_OPPORTUNITY") {
    if (!opportunity) {
      ok(res, {
        intent: intent.intent,
        reply: await spoken(replyNeedOpportunity(language)),
      });
      return;
    }
    const storedDecision = analysis && analysis.opportunityId === opportunity.id ? analysis.decision : undefined;
    ok(res, {
      intent: intent.intent,
      reply: await spoken(replyDetails(language, opportunity, storedDecision)),
      opportunity,
    });
    return;
  }

  if (intent.intent === "UPDATE_PROFILE") {
    if (intent.replyHint === "profile_summary") {
      const profile = store.profiles.find((item) => item.userId === userId);
      if (!profile) {
        fail(res, "Create a profile before asking HULUM.", 404, "PROFILE_NOT_FOUND");
        return;
      }
      ok(res, {
        intent: intent.intent,
        reply: await spoken(formatProfileSummary(profile, profile.name)),
      });
      return;
    }
    if (intent.replyHint === "profile_gaps") {
      const profile = store.profiles.find((item) => item.userId === userId);
      if (!profile) {
        fail(res, "Create a profile before asking HULUM.", 404, "PROFILE_NOT_FOUND");
        return;
      }
      const gaps = profileCompleteness(profile);
      ok(res, {
        intent: intent.intent,
        reply: formatProfileGaps(gaps.missing),
      });
      return;
    }
    if (intent.replyHint === "profile_extract") {
      const description = stripProfileExtractDescription(text);
      if (description.length < 8) {
        ok(res, {
          intent: intent.intent,
          reply:
            "Paste a short self-description after the request, or open Profile and use Propose profile fields. Nothing is saved until you confirm.",
        });
        return;
      }
      const proposed = await proposeProfileExtract(description, chat);
      ok(res, {
        intent: intent.intent,
        reply: formatProfileExtractReply(proposed),
      });
      return;
    }
    ok(res, {
      intent: intent.intent,
      reply:
        "Open your profile to update education, skills, or documents. To propose fields from speech or text, say “Extract profile from this: …” — confirm on Profile before save. Voice cannot silently change stored facts.",
    });
    return;
  }

  if (intent.intent === "ANALYZE_OPPORTUNITY") {
    if (!opportunity) {
      ok(res, {
        intent: intent.intent,
        reply: await spoken(replyNeedOpportunity(language)),
      });
      return;
    }
    const result = await runAnalysis(userId, opportunity.id);
    if (!result.ok) {
      if (result.code === "PROFILE_NOT_FOUND") {
        fail(res, result.message, result.status, result.code);
        return;
      }
      ok(res, {
        intent: intent.intent,
        reply: result.message,
        opportunity,
      });
      return;
    }
    const includeList = wantsListWithAnalyze(text);
    const checks = result.detail.requirements.map((item) => ({
      text: item.requirementText,
      status: item.status,
      reason: item.reason,
    }));
    const gaps = (result.detail.gaps ?? []).map((item) =>
      item.remediation.trim()
        ? `${item.requirement}: ${item.remediation} (${item.status})`
        : `${item.requirement} (${item.status})`,
    );
    const extra = {
      summary: result.detail.summary,
      gaps,
      checks,
      sourceUrl: result.detail.opportunity.sourceUrl,
    };
    const reply = includeList
      ? replyListThenAnalysis(
          language,
          analyzePool,
          intent.type,
          result.detail.opportunity.title,
          result.detail.decision,
          result.detail.fitScore,
          result.detail.nextAction,
          extra,
        )
      : replyAnalysis(
          language,
          result.detail.opportunity.title,
          result.detail.decision,
          result.detail.fitScore,
          result.detail.nextAction,
          extra,
        );
    ok(res, {
      intent: intent.intent,
      reply: await spoken(reply),
      analysis: result.detail,
      opportunity: result.detail.opportunity,
      ...(includeList ? { opportunities: analyzePool } : {}),
    });
    return;
  }

  if (analysis) {
    const requirements = store.requirementResults.filter((item) => item.analysisId === analysis.id);
    const readiness = store.readinessItems.filter((item) => item.analysisId === analysis.id);
    const checks = requirements.map((item) => ({
      text: item.requirementText,
      status: item.status,
      reason: item.reason,
    }));
    const gaps = requirements
      .filter((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN")
      .map((item) => {
        const reason = item.reason.trim();
        return reason === "" ? `${item.requirementText} (${item.status})` : `${item.requirementText}: ${reason} (${item.status})`;
      });

    if (intent.intent === "EXPLAIN_DECISION") {
      const relatedOpportunity =
        opportunity ?? store.opportunities.find((item) => item.id === analysis.opportunityId);
      const relatedProfile = store.profiles.find((item) => item.userId === analysis.userId);
      ok(res, {
        intent: intent.intent,
        reply: await spoken(
          replyExplain(language, analysis.decision, analysis.explanation ?? analysis.summary, checks),
        ),
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
    if (intent.intent === "SHOW_MISSING_REQUIREMENTS") {
      const relatedOpportunity =
        opportunity ?? store.opportunities.find((item) => item.id === analysis.opportunityId);
      const relatedProfile = store.profiles.find((item) => item.userId === analysis.userId);
      if (intent.replyHint === "clarify_uncertain") {
        const uncertainOnly = requirements
          .filter((item) => item.status === "UNCERTAIN")
          .map((item) => `${item.requirementText} (${item.reason})`);
        ok(res, {
          intent: intent.intent,
          reply: uncertainOnly.length
            ? `These requirements are UNCERTAIN — confirm them on the official source before treating them as met: ${uncertainOnly.join("; ")}`
            : "No UNCERTAIN requirements are stored for this analysis. Confirm any doubt on the official source; HULUM is not the organization.",
          analysis:
            relatedOpportunity && relatedProfile
              ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
              : undefined,
          opportunity: relatedOpportunity,
        });
        return;
      }
      ok(res, {
        intent: intent.intent,
        reply: await spoken(replyGaps(language, gaps)),
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
    if (intent.intent === "SHOW_READINESS") {
      const relatedOpportunity =
        opportunity ?? store.opportunities.find((item) => item.id === analysis.opportunityId);
      const relatedProfile = store.profiles.find((item) => item.userId === analysis.userId);
      const list = readiness.length
        ? readiness.map((item) => `${item.title} (${item.status.replace("_", " ")})`).join("; ")
        : "No readiness checklist is stored yet.";
      ok(res, {
        intent: intent.intent,
        reply: await spoken(replyReadiness(language, analysis.nextAction, list)),
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
  }

  if (["EXPLAIN_DECISION", "SHOW_MISSING_REQUIREMENTS", "SHOW_READINESS"].includes(intent.intent)) {
    ok(res, {
      intent: intent.intent,
      reply: await spoken(replyNeedAnalysis(language)),
    });
    return;
  }

  ok(res, {
    intent: "UNSUPPORTED",
    reply: await spoken(replyUnsupported(language)),
  });
});
