import { Decision, Language, ReadinessStatus, type Analysis } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import {
  fallbackReadinessPlan,
  isUnsafeReadinessPlan,
  readinessPlanFrom,
  sanitizeReadinessPlan,
} from "./readinessPlan.js";

const analysis: Analysis = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: "11111111-1111-4111-8111-111111111111",
  opportunityId: "33333333-3333-4333-8333-333333333333",
  decision: Decision.MAYBE,
  fitScore: 62,
  summary: "Maybe — confirm a few requirements first.",
  nextAction: "Resolve uncertain requirements, then re-check the official source.",
  readiness: [
    {
      id: "r1",
      analysisId: "44444444-4444-4444-8444-444444444444",
      title: "Prepare CV",
      description: null,
      status: ReadinessStatus.TODO,
      priority: 1,
      createdAt: "2026-09-21T00:00:00.000Z",
      updatedAt: "2026-09-21T00:00:00.000Z",
    },
    {
      id: "r2",
      analysisId: "44444444-4444-4444-8444-444444444444",
      title: "Resolve the language requirement",
      description: null,
      status: ReadinessStatus.TODO,
      priority: 2,
      createdAt: "2026-09-21T00:00:00.000Z",
      updatedAt: "2026-09-21T00:00:00.000Z",
    },
  ],
  createdAt: "2026-09-21T00:00:00.000Z",
  updatedAt: "2026-09-21T00:00:00.000Z",
};

describe("readiness plan guards", () => {
  it("accepts prose that covers stored checklist titles", () => {
    const text =
      "With a MAYBE decision, prioritize Prepare CV and Resolve the language requirement, then re-check the official source.";
    expect(isUnsafeReadinessPlan(analysis, text)).toBe(false);
    expect(sanitizeReadinessPlan(analysis, text)).toBe(text);
  });

  it("falls back when titles are missing or a URL is invented", () => {
    expect(isUnsafeReadinessPlan(analysis, "Just apply now.")).toBe(true);
    expect(sanitizeReadinessPlan(analysis, "See https://fake.example")).toContain("Prepare CV");
    expect(fallbackReadinessPlan(analysis)).toContain("Prepare CV");
  });

  it("keeps the stored decision on the plan object", () => {
    const plan = readinessPlanFrom(analysis, Language.ENGLISH, "Just APPLY immediately.");
    expect(plan.decision).toBe(Decision.MAYBE);
    expect(plan.plan).toContain("Prepare CV");
    expect(plan.items).toHaveLength(2);
  });
});
