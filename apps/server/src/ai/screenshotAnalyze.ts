import {
  OpportunityType,
  SCREENSHOT_ANALYZE_NOTICE,
  VerificationStatus,
  type Opportunity,
  type Profile,
  type ScreenshotAnalyzeResult,
  type ScreenshotExtracted,
} from "@hulum/shared";
import { analysisSummaryFor } from "../analysis/summary.js";
import { decide } from "../decision/decide.js";
import type { Clock } from "../services/common/clock.js";

export function canDecideFromScreenshot(extracted: ScreenshotExtracted): boolean {
  return extracted.title !== null && extracted.organization !== null && extracted.description !== null;
}

export function opportunityFromScreenshot(extracted: ScreenshotExtracted, nowIso: string): Opportunity {
  const type =
    extracted.type !== null && Object.values(OpportunityType).includes(extracted.type as OpportunityType)
      ? (extracted.type as OpportunityType)
      : OpportunityType.INTERNSHIP;
  return {
    id: "screenshot-ephemeral",
    title: extracted.title ?? "Untitled screenshot",
    organization: extracted.organization ?? "Unknown organization",
    type,
    description: extracted.description ?? "",
    deadline: extracted.deadline ?? "",
    countryEligibility: extracted.countryEligibility,
    educationRequirements: extracted.educationRequirements,
    fieldRequirements: extracted.fieldRequirements,
    experienceRequirements: extracted.experienceRequirements,
    languageRequirements: extracted.languageRequirements,
    documentRequirements: extracted.documentRequirements,
    otherRequirements: [],
    applicationUrl: extracted.applicationUrl,
    sourceUrl: extracted.sourceUrl ?? "screenshot://user-upload",
    verificationStatus: VerificationStatus.AI_EXTRACTED,
    lastVerifiedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function analyzeScreenshotExtract(
  extracted: ScreenshotExtracted,
  profile: Profile | undefined,
  clock: Clock,
): ScreenshotAnalyzeResult {
  if (profile === undefined || !canDecideFromScreenshot(extracted)) {
    return {
      extracted,
      decision: null,
      canDecide: false,
      notice:
        profile === undefined
          ? `${SCREENSHOT_ANALYZE_NOTICE} Save a profile first so HULUM can compare these facts to you.`
          : `${SCREENSHOT_ANALYZE_NOTICE} The photo did not show a clear title, organization, and description, so HULUM did not decide APPLY / MAYBE / SKIP.`,
    };
  }

  const opportunity = opportunityFromScreenshot(extracted, clock.now().toISOString());
  const result = decide(profile, opportunity, clock);
  return {
    extracted,
    canDecide: true,
    notice: SCREENSHOT_ANALYZE_NOTICE,
    decision: {
      decision: result.decision,
      fitScore: result.fitScore,
      summary: analysisSummaryFor(result.decision),
      nextAction: result.nextAction,
      reasons: result.reasons,
      matched: result.matchedRequirements.map((item) => item.text),
      missing: result.missingRequirements.map((item) => item.text),
      uncertain: result.uncertainRequirements.map((item) => item.text),
    },
  };
}
