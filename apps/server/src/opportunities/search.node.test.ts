import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Opportunity } from "@hulum/shared";
import { filterOpportunities, matchesOpportunityQuery } from "./search.js";

function sample(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-a2sv",
    title: "A2SV AI Fellowship",
    organization: "Africa to Silicon Valley",
    type: "fellowship",
    description: "Software engineering training for African students.",
    deadline: "2026-12-31T00:00:00.000Z",
    countryEligibility: ["Africa", "Ethiopia"],
    educationRequirements: "Currently enrolled university student",
    fieldRequirements: "Computer science or software engineering",
    experienceRequirements: "",
    languageRequirements: "English",
    documentRequirements: [],
    otherRequirements: [],
    applicationUrl: "https://example.org",
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

describe("opportunity search", () => {
  const items = [
    sample(),
    sample({
      id: "opp-chevening",
      title: "Chevening Scholarship",
      organization: "UK Foreign, Commonwealth & Development Office",
      type: "scholarship",
      description: "UK master's scholarship.",
      fieldRequirements: "Any field",
    }),
  ];

  it("matches title, org, and type label", () => {
    assert.equal(matchesOpportunityQuery(items[0], "a2sv"), true);
    assert.equal(matchesOpportunityQuery(items[0], "silicon"), true);
    assert.equal(matchesOpportunityQuery(items[0], "fellowship"), true);
    assert.equal(matchesOpportunityQuery(items[0], "zzzz"), false);
  });

  it("combines type filter with query", () => {
    const found = filterOpportunities(items, { type: "scholarship", q: "chevening" });
    assert.equal(found.length, 1);
    assert.equal(found[0].id, "opp-chevening");
    assert.equal(filterOpportunities(items, { type: "scholarship", q: "a2sv" }).length, 0);
  });
});
