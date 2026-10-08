import type { Opportunity } from "@hulum/shared";

const LIST_TTL_MS = 20_000;

let cache: { items: Opportunity[]; expiresAt: number } | null = null;

function cacheEnabled(): boolean {
  return process.env.NODE_ENV !== "test";
}

export function readOpportunityListCache(): Opportunity[] | null {
  if (!cacheEnabled() || cache === null || Date.now() >= cache.expiresAt) {
    cache = null;
    return null;
  }
  return cache.items;
}

export function writeOpportunityListCache(items: Opportunity[]): void {
  if (!cacheEnabled()) {
    return;
  }
  cache = { items, expiresAt: Date.now() + LIST_TTL_MS };
}

export function invalidateOpportunityListCache(): void {
  cache = null;
}
