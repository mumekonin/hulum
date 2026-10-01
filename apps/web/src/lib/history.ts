import type { AnalysisSummary, Decision, SavedOpportunity } from "@hulum/shared";
import { api } from "./api";

export function fetchMyAnalyses(opportunityId?: string): Promise<AnalysisSummary[]> {
  const query = opportunityId ? `?opportunityId=${encodeURIComponent(opportunityId)}` : "";
  return api<AnalysisSummary[]>(`/api/analyses${query}`);
}

export function fetchSaved(): Promise<SavedOpportunity[]> {
  return api<SavedOpportunity[]>("/api/saved");
}

export function saveOpportunity(opportunityId: string): Promise<SavedOpportunity> {
  return api<SavedOpportunity>("/api/saved", {
    method: "POST",
    body: JSON.stringify({ opportunityId }),
  });
}

export async function unsaveOpportunity(opportunityId: string): Promise<void> {
  await api<{ opportunityId: string }>(`/api/saved/${encodeURIComponent(opportunityId)}`, {
    method: "DELETE",
  });
}

/** Stored decide() results keyed by opportunity id. Never computed in the browser. */
export function decisionsById(analyses: AnalysisSummary[]): Map<string, Decision> {
  return new Map(analyses.map((row) => [row.opportunityId, row.decision]));
}

export type DecisionFilter = Decision | "unanalyzed" | "";

export const DECISION_FILTER_OPTIONS: Array<{ value: DecisionFilter; label: string }> = [
  { value: "", label: "Any decision" },
  { value: "APPLY", label: "Apply" },
  { value: "MAYBE", label: "Maybe" },
  { value: "SKIP", label: "Skip" },
  { value: "unanalyzed", label: "Not analyzed yet" },
];

export function matchesDecision(
  opportunityId: string,
  filter: DecisionFilter,
  decisions: Map<string, Decision>,
): boolean {
  if (filter === "") return true;
  const decision = decisions.get(opportunityId);
  return filter === "unanalyzed" ? decision === undefined : decision === filter;
}
