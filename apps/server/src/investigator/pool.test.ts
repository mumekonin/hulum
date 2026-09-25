import { describe, expect, it } from "vitest";
import {
  INVESTIGATE_BUDGET_MS,
  budgetDeadline,
  budgetExpired,
  mapPool,
  takeBatch,
} from "./pool.js";

describe("investigate pool", () => {
  it("keeps a 15 second catalog budget", () => {
    expect(INVESTIGATE_BUDGET_MS).toBe(15_000);
    const deadline = budgetDeadline(1_000, INVESTIGATE_BUDGET_MS);
    expect(budgetExpired(deadline, 15_999)).toBe(false);
    expect(budgetExpired(deadline, 16_000)).toBe(true);
  });

  it("takes a batch from the front of the queue", () => {
    const queue = [1, 2, 3, 4];
    expect(takeBatch(queue, 2)).toEqual([1, 2]);
    expect(queue).toEqual([3, 4]);
  });

  it("runs at most the requested concurrency", async () => {
    let live = 0;
    let peak = 0;
    const items = [1, 2, 3, 4, 5];
    await mapPool(items, 2, async (item) => {
      live += 1;
      peak = Math.max(peak, live);
      await new Promise((resolve) => setTimeout(resolve, 20));
      live -= 1;
      return item * 2;
    });
    expect(peak).toBeLessThanOrEqual(2);
  });
});
