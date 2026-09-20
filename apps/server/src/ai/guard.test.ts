import { Decision, type Analysis } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { fallbackExplanation, isUnsafeExplanation, sanitizeExplanation } from "./guard.js";

const analysis: Analysis = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: "11111111-1111-4111-8111-111111111111",
  opportunityId: "33333333-3333-4333-8333-333333333333",
  decision: Decision.APPLY,
  fitScore: 91,
  summary: "You meet the key known requirements.",
  requirements: [],
  nextAction: "Prepare your application materials and verify the official source.",
  readiness: [],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("sanitizeExplanation", () => {
  it("keeps a safe Groq reply that does not contradict APPLY", () => {
    const text = "You meet the listed country and education requirements.";
    expect(isUnsafeExplanation(analysis, text)).toBe(false);
    expect(sanitizeExplanation(analysis, text)).toBe(text);
  });

  it("replaces empty or short output with the stored fallback", () => {
    expect(sanitizeExplanation(analysis, "")).toBe(fallbackExplanation(analysis));
    expect(sanitizeExplanation(analysis, "too short")).toBe(fallbackExplanation(analysis));
  });

  it("replaces a contradictory SKIP when the stored decision is APPLY", () => {
    const text = "This opportunity is a SKIP and you should not apply.";
    expect(isUnsafeExplanation(analysis, text)).toBe(true);
    expect(sanitizeExplanation(analysis, text)).toBe(fallbackExplanation(analysis));
  });

  it("replaces JSON and invented URLs", () => {
    expect(sanitizeExplanation(analysis, '{"decision":"APPLY","why":"ok enough text here"}')).toBe(
      fallbackExplanation(analysis),
    );
    expect(
      sanitizeExplanation(analysis, "Read more at https://example.invalid/apply now please."),
    ).toBe(fallbackExplanation(analysis));
  });

  it("returns the same fallback for the same stored analysis", () => {
    expect(fallbackExplanation(analysis)).toEqual(fallbackExplanation(analysis));
    expect(fallbackExplanation(analysis).length).toBeGreaterThan(24);
  });
});
