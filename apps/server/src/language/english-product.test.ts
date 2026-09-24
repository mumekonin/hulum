import { Decision, OPPORTUNITY_TYPES, TYPE_LABELS, type Opportunity } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { fallbackExplanation, isUnsafeExplanation, sanitizeExplanation } from "../ai/guard.js";
import { filterOpportunities, matchesOpportunityQuery } from "../opportunities/search.js";

/**
 * Phase 13 P1 — English opportunity terminology + decision explanations.
 * Amharic/Oromo voice terminology stays open (ADR 004).
 */

function sample(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Sample Opportunity",
    organization: "Sample Org",
    type: "scholarship",
    description: "A curated official-source listing.",
    deadline: "2026-12-31T00:00:00.000Z",
    countryEligibility: ["Ethiopia"],
    educationRequirements: "Bachelor",
    fieldRequirements: "Computer science",
    experienceRequirements: "",
    languageRequirements: "English",
    documentRequirements: [],
    otherRequirements: [],
    applicationUrl: "https://example.org/apply",
    sourceUrl: "https://example.org",
    sourceType: "official_organization",
    verificationStatus: "VERIFIED",
    lastVerifiedAt: "2026-09-18T00:00:00.000Z",
    requirements: [],
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("English opportunity terminology", () => {
  it("exposes a stable label for every opportunity type", () => {
    for (const type of OPPORTUNITY_TYPES) {
      expect(TYPE_LABELS[type].length).toBeGreaterThan(0);
      expect(TYPE_LABELS[type]).not.toMatch(/undefined/i);
    }
  });

  it("matches type labels in search (scholarship, fellowship, internship, …)", () => {
    const items = OPPORTUNITY_TYPES.map((type, index) =>
      sample({
        id: `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb${String(index).padStart(2, "0")}`,
        type,
        title: `Listing ${type}`,
      }),
    );
    for (const type of OPPORTUNITY_TYPES) {
      const label = TYPE_LABELS[type].toLowerCase();
      expect(matchesOpportunityQuery(items.find((item) => item.type === type)!, label)).toBe(true);
      expect(filterOpportunities(items, { type }).every((item) => item.type === type)).toBe(true);
    }
  });
});

describe("English decision explanations", () => {
  const base = {
    id: "44444444-4444-4444-8444-444444444444",
    userId: "11111111-1111-4111-8111-111111111111",
    opportunityId: "33333333-3333-4333-8333-333333333333",
    fitScore: 70,
    summary: "Stored summary for the deterministic decision.",
    requirements: [],
    nextAction: "Prepare your application materials and verify the official source.",
    readiness: [],
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  } as const;

  it("keeps APPLY / MAYBE / SKIP wording aligned with the stored decision", () => {
    for (const decision of [Decision.APPLY, Decision.MAYBE, Decision.SKIP] as const) {
      const analysis = { ...base, decision };
      const safe = `HULUM stored decision is ${decision}. Confirm details on the official source before you invest time.`;
      expect(isUnsafeExplanation(analysis, safe)).toBe(false);
      expect(sanitizeExplanation(analysis, safe)).toBe(safe);
      const fallback = fallbackExplanation(analysis);
      expect(fallback).toContain(analysis.summary);
      expect(fallback.toLowerCase()).toMatch(/official source/);
    }
  });

  it("rejects explanations that flip APPLY into SKIP", () => {
    const analysis = { ...base, decision: Decision.APPLY };
    const flipped = "This is a SKIP. You should not apply to this opportunity at all.";
    expect(isUnsafeExplanation(analysis, flipped)).toBe(true);
    expect(sanitizeExplanation(analysis, flipped)).toBe(fallbackExplanation(analysis));
  });
});
