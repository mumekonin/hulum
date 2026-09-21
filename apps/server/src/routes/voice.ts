import { Router } from "express";
import { profileCompleteness, voiceActionSchema } from "@hulum/shared";
import { runAnalysis, toAnalysisDetail } from "../analysis/runAnalysis.js";
import { analyzeOpportunity } from "../decision/engine.js";
import { fail, ok } from "../lib/http.js";
import { createId, nowIso } from "../lib/id.js";
import { recordOpsEvent, timeOps } from "../ops/metrics.js";
import {
  formatOpportunityContext,
  formatOpportunityList,
  formatProfileGaps,
  parseVoiceIntent,
} from "../voice/intents.js";
import { findLatestAnalysis } from "../voice/findAnalysis.js";
import { loadStore, mutateStore } from "../store/fileStore.js";

export const voiceRouter = Router();

voiceRouter.post("/session", async (req, res) => {
  try {
    const result = await timeOps("session", "voice.session", async () => {
      const userId =
        typeof req.body?.userId === "string" && req.body.userId.trim()
          ? req.body.userId.trim()
          : "anonymous";
      const language =
        req.body?.language === "am" || req.body?.language === "om" ? req.body.language : "en";
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
      return {
        ...session,
        provider: process.env.VOXIDE_API_KEY ? "voxide" : "text-fallback",
      };
    });
    ok(res, result, 201);
  } catch (error) {
    recordOpsEvent({
      kind: "session",
      name: "voice.session",
      ok: false,
      ms: 0,
      code: "SESSION_FAILED",
    });
    throw error;
  }
});

voiceRouter.post("/action", async (req, res) => {
  const parsed = voiceActionSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "Voice action needs text and a user id.", 422, "INVALID_VOICE");
    return;
  }

  const store = await loadStore();
  const { text, language = "en", userId, opportunityId, analysisId } = parsed.data;
  const intent = parseVoiceIntent(text, language);
  const opportunities = store.opportunities;
  const analysis = findLatestAnalysis(store, { analysisId, userId, opportunityId });
  const opportunity = opportunityId
    ? opportunities.find((item) => item.id === opportunityId)
    : analysis
      ? opportunities.find((item) => item.id === analysis.opportunityId)
      : undefined;

  if (intent.intent === "SHOW_OPPORTUNITIES") {
    ok(res, {
      intent: intent.intent,
      reply: `Here are current opportunities: ${formatOpportunityList(opportunities)}`,
      opportunities,
    });
    return;
  }

  if (intent.intent === "FILTER_OPPORTUNITIES") {
    const filtered = intent.type
      ? opportunities.filter((item) => item.type === intent.type)
      : opportunities;
    ok(res, {
      intent: intent.intent,
      reply: filtered.length
        ? `Filtered to ${intent.type}: ${formatOpportunityList(filtered)}`
        : "No opportunities matched that filter.",
      opportunities: filtered,
    });
    return;
  }

  if (intent.intent === "FILTER_BY_DECISION") {
    const decision = intent.decision;
    if (!decision) {
      ok(res, {
        intent: intent.intent,
        reply: "Say APPLY, MAYBE, or SKIP when filtering opportunities by decision.",
      });
      return;
    }
    const profile = store.profiles.find((item) => item.userId === userId);
    if (!profile) {
      fail(res, "Create a profile before asking HULUM to analyze.", 404, "PROFILE_NOT_FOUND");
      return;
    }
    const filtered = opportunities.filter(
      (item) => analyzeOpportunity(profile, item).decision === decision,
    );
    ok(res, {
      intent: intent.intent,
      reply: filtered.length
        ? `${decision} opportunities: ${formatOpportunityList(filtered)}`
        : `No ${decision} opportunities for your profile.`,
      opportunities: filtered,
    });
    return;
  }

  if (intent.intent === "OPEN_OPPORTUNITY") {
    if (!opportunity) {
      ok(res, {
        intent: intent.intent,
        reply: "Choose an opportunity first, then I can tell you about it from the stored record.",
      });
      return;
    }
    const storedDecision =
      analysis && analysis.opportunityId === opportunity.id ? analysis.decision : undefined;
    ok(res, {
      intent: intent.intent,
      reply: formatOpportunityContext(opportunity, storedDecision),
      opportunity,
    });
    return;
  }

  if (intent.intent === "UPDATE_PROFILE") {
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
    ok(res, {
      intent: intent.intent,
      reply:
        "Open your profile to update education, skills, or documents. Voice cannot silently change stored facts.",
    });
    return;
  }

  if (intent.intent === "ANALYZE_OPPORTUNITY") {
    if (!opportunity) {
      ok(res, {
        intent: intent.intent,
        reply: "Choose an opportunity first, then ask whether you should apply.",
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
    ok(res, {
      intent: intent.intent,
      reply: `${result.detail.decision} for ${result.detail.opportunity.title}. Fit ${result.detail.fitScore}%. ${result.detail.nextAction}`,
      analysis: result.detail,
      opportunity: result.detail.opportunity,
    });
    return;
  }

  if (analysis) {
    const requirements = store.requirementResults.filter((item) => item.analysisId === analysis.id);
    const readiness = store.readinessItems.filter((item) => item.analysisId === analysis.id);
    const gaps = requirements
      .filter((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN")
      .map((item) => `${item.requirementText} (${item.status})`);

    if (intent.intent === "EXPLAIN_DECISION") {
      const relatedOpportunity =
        opportunity ?? store.opportunities.find((item) => item.id === analysis.opportunityId);
      const relatedProfile = store.profiles.find((item) => item.userId === analysis.userId);
      ok(res, {
        intent: intent.intent,
        reply: `${analysis.decision}. ${analysis.explanation}`,
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(
                analysis,
                relatedOpportunity,
                relatedProfile,
                requirements,
                readiness,
              )
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
              ? toAnalysisDetail(
                  analysis,
                  relatedOpportunity,
                  relatedProfile,
                  requirements,
                  readiness,
                )
              : undefined,
          opportunity: relatedOpportunity,
        });
        return;
      }
      ok(res, {
        intent: intent.intent,
        reply: gaps.length
          ? `Missing or uncertain: ${gaps.join("; ")}`
          : "No missing or uncertain requirements are stored for this analysis.",
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(
                analysis,
                relatedOpportunity,
                relatedProfile,
                requirements,
                readiness,
              )
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
        reply: readiness.length
          ? `${analysis.nextAction} Prepare: ${list}`
          : `${analysis.nextAction} ${list}`,
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(
                analysis,
                relatedOpportunity,
                relatedProfile,
                requirements,
                readiness,
              )
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
  }

  if (["EXPLAIN_DECISION", "SHOW_MISSING_REQUIREMENTS", "SHOW_READINESS"].includes(intent.intent)) {
    ok(res, {
      intent: intent.intent,
      reply:
        "Analyze an opportunity first, then I can explain the decision, gaps, or readiness plan.",
    });
    return;
  }

  ok(res, {
    intent: "UNSUPPORTED",
    reply:
      "I can show opportunities, filter internships or scholarships, filter APPLY MAYBE or SKIP, analyze a selected opportunity, explain a decision, or list what to prepare. You can also type instead of speaking.",
  });
});
