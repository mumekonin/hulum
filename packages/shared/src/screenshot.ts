import type { Decision } from "./enums.js";

export type ScreenshotExtracted = {
  title: string | null;
  organization: string | null;
  type: string | null;
  description: string | null;
  deadline: string | null;
  countryEligibility: string[];
  educationRequirements: string[];
  fieldRequirements: string[];
  experienceRequirements: string[];
  languageRequirements: string[];
  documentRequirements: string[];
  applicationUrl: string | null;
  sourceUrl: string | null;
  visibleText: string | null;
};

export type ScreenshotDecisionView = {
  decision: Decision;
  fitScore: number;
  summary: string;
  nextAction: string;
  reasons: string[];
  matched: string[];
  missing: string[];
  uncertain: string[];
};

export type ScreenshotAnalyzeResult = {
  extracted: ScreenshotExtracted;
  decision: ScreenshotDecisionView | null;
  canDecide: boolean;
  notice: string;
};

export const SCREENSHOT_ANALYZE_NOTICE =
  "HULUM only used text visible in your photo. This is not saved to the public catalog. Always confirm the deadline, eligibility, and apply link on the official organization page.";
