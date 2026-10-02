/** Enough wall time to walk source sitemaps and extract open listing pages. */
export const INVESTIGATE_BUDGET_MS = 1_200_000;
export const FETCH_CONCURRENCY = 8;
export const EXTRACT_CONCURRENCY = 3;

export function budgetDeadline(startedAt: number, budgetMs: number = INVESTIGATE_BUDGET_MS): number {
  return startedAt + budgetMs;
}

export function budgetRemaining(deadlineAt: number, now: number = Date.now()): number {
  return Math.max(0, deadlineAt - now);
}

export function budgetExpired(deadlineAt: number, now: number = Date.now()): boolean {
  return now >= deadlineAt;
}

export function takeBatch<T>(queue: T[], size: number): T[] {
  return queue.splice(0, size);
}

export function takePrioritized<T>(queue: T[], size: number, score: (item: T) => number): T[] {
  queue.sort((left, right) => score(right) - score(left));
  return queue.splice(0, size);
}

/** Run work with a fixed concurrency cap. */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }
  const limit = Math.max(1, concurrency);
  const results: R[] = new Array(items.length);
  let next = 0;

  async function runOne(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index] as T);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runOne());
  await Promise.all(runners);
  return results;
}
