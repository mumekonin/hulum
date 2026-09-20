import type { Analysis } from "@hulum/shared";
import type { StoreShape } from "../store/fileStore.js";

export function findLatestAnalysis(
  store: StoreShape,
  options: { analysisId?: string; userId: string; opportunityId?: string },
): Analysis | undefined {
  if (options.analysisId) {
    return store.analyses.find((item) => item.id === options.analysisId);
  }

  const matches = store.analyses.filter((item) => {
    if (item.userId !== options.userId) return false;
    if (options.opportunityId && item.opportunityId !== options.opportunityId) return false;
    return true;
  });

  return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
