import type { Decision, OpportunityType } from "./enums.js";

/**
 * The signed-in user's latest analysis for one opportunity (GET /api/analyses).
 * `decision` is the stored decide() result, never recomputed by the client.
 */
export type AnalysisSummary = {
  analysisId: string;
  opportunityId: string;
  title: string;
  organization: string;
  type: OpportunityType;
  deadline: string;
  decision: Decision;
  fitScore: number;
  analyzedAt: string;
  readiness: {
    done: number;
    /** Items that apply to this opportunity (NOT_REQUIRED excluded). */
    total: number;
  };
};

/** An opportunity the user saved (GET/POST /api/saved). */
export type SavedOpportunity = {
  opportunityId: string;
  savedAt: string;
};
