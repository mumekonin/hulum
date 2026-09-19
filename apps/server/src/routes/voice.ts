import { Router } from "express";
import { voiceActionSchema } from "@hulum/shared";
import { runAnalysis, toAnalysisDetail } from "../analysis/runAnalysis.js";
import { fail, ok } from "../lib/http.js";
import { createId, nowIso } from "../lib/id.js";
import { formatOpportunityList, parseVoiceIntent } from "../voice/intents.js";
import { findLatestAnalysis } from "../voice/findAnalysis.js";
import { loadStore } from "../store/fileStore.js";

export const voiceRouter = Router();

voiceRouter.post("/session", async (req, res) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "anonymous";
  const language = req.body?.language === "am" || req.body?.language === "om" ? req.body.language : "en";
  ok(res, {
    id: createId("voice"),
    userId,
    language,
    startedAt: nowIso(),
    provider: process.env.VOXIDE_API_KEY ? "voxide" : "text-fallback",
  }, 201);
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
    const filtered = intent.type ? opportunities.filter((item) => item.type === intent.type) : opportunities;
    ok(res, {
      intent: intent.intent,
      reply: filtered.length
        ? `Filtered to ${intent.type}: ${formatOpportunityList(filtered)}`
        : "No opportunities matched that filter.",
      opportunities: filtered,
    });
    return;
  }

  if (intent.intent === "OPEN_OPPORTUNITY") {
    const target = opportunity ?? opportunities[0];
    ok(res, {
      intent: intent.intent,
      reply: target ? `Opening ${target.title}.` : "I need an opportunity to open.",
      opportunity: target,
    });
    return;
  }

  if (intent.intent === "UPDATE_PROFILE") {
    ok(res, {
      intent: intent.intent,
      reply: "Open your profile to update education, skills, or documents. Voice cannot silently change stored facts.",
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
            ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
    if (intent.intent === "SHOW_GAPS") {
      const relatedOpportunity =
        opportunity ?? store.opportunities.find((item) => item.id === analysis.opportunityId);
      const relatedProfile = store.profiles.find((item) => item.userId === analysis.userId);
      ok(res, {
        intent: intent.intent,
        reply: gaps.length
          ? `Missing or uncertain: ${gaps.join("; ")}`
          : "No missing or uncertain requirements are stored for this analysis.",
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
        reply: readiness.length ? `${analysis.nextAction} Prepare: ${list}` : `${analysis.nextAction} ${list}`,
        analysis:
          relatedOpportunity && relatedProfile
            ? toAnalysisDetail(analysis, relatedOpportunity, relatedProfile, requirements, readiness)
            : undefined,
        opportunity: relatedOpportunity,
      });
      return;
    }
  }

  if (["EXPLAIN_DECISION", "SHOW_GAPS", "SHOW_READINESS"].includes(intent.intent)) {
    ok(res, {
      intent: intent.intent,
      reply: "Analyze an opportunity first, then I can explain the decision, gaps, or readiness plan.",
    });
    return;
  }

  ok(res, {
    intent: "UNSUPPORTED",
    reply: "I can show opportunities, filter internships or scholarships, analyze a selected opportunity, explain a decision, or list what to prepare. You can also type instead of speaking.",
  });
});
