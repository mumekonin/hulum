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

/** APPLY, then MAYBE, then unanalyzed, then SKIP. Does not call decide() in the browser. */
function storedDecisionRank(opportunityId: string, decisions: Map<string, Decision>): number {
  const decision = decisions.get(opportunityId);
  if (decision === "APPLY") return 0;
  if (decision === "MAYBE") return 1;
  if (decision === "SKIP") return 3;
  return 2;
}

export function sortByStoredDecision<T extends { id: string }>(
  items: T[],
  decisions: Map<string, Decision> | null,
): T[] {
  if (decisions === null || decisions.size === 0) {
    return items;
  }
  return [...items].sort(
    (a, b) => storedDecisionRank(a.id, decisions) - storedDecisionRank(b.id, decisions),
  );
}
