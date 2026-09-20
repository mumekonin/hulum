import { describe, expect, it } from "vitest";
import type { Clock } from "../services/common/clock.js";
import { createRateLimiter } from "./rate-limit.js";

describe("createRateLimiter", () => {
  it("allows up to max hits in the window and then rejects", () => {
    let now = 1_000;
    const clock: Clock = { now: () => new Date(now) };
    const limiter = createRateLimiter({ windowMs: 1_000, max: 2, clock });

    expect(limiter.allow("1.1.1.1")).toBe(true);
    expect(limiter.allow("1.1.1.1")).toBe(true);
    expect(limiter.allow("1.1.1.1")).toBe(false);
    expect(limiter.allow("2.2.2.2")).toBe(true);
  });

  it("resets after the window", () => {
    let now = 1_000;
    const clock: Clock = { now: () => new Date(now) };
    const limiter = createRateLimiter({ windowMs: 1_000, max: 1, clock });

    expect(limiter.allow("1.1.1.1")).toBe(true);
    expect(limiter.allow("1.1.1.1")).toBe(false);
    now = 2_001;
    expect(limiter.allow("1.1.1.1")).toBe(true);
  });
});
