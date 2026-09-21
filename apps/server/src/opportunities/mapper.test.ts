import { OpportunityType, VerificationStatus } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { mapOpportunityRow, type OpportunityRow } from "./mapper.js";

function sampleRow(overrides: Partial<OpportunityRow> = {}): OpportunityRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Mapper fixture",
    organization: "HULUM Test",
    type: OpportunityType.SCHOLARSHIP,
    description: "Used only to test row mapping.",
    deadline: new Date("2026-12-31T00:00:00.000Z"),
    country_eligibility: ["ET"],
    education_requirements: ["university_student"],
    field_requirements: ["computer_science"],
    experience_requirements: [],
    language_requirements: ["en"],
    document_requirements: ["cv"],
    other_requirements: [],
    application_url: "https://example.invalid/apply",
    source_url: "https://example.invalid/source",
    verification_status: VerificationStatus.NEEDS_REVIEW,
    last_verified_at: null,
    created_at: new Date("2026-09-19T00:00:00.000Z"),
    updated_at: new Date("2026-09-19T00:00:00.000Z"),
    ...overrides,
  };
}

describe("mapOpportunityRow", () => {
  it("maps structured requirements and source fields", () => {
    const opportunity = mapOpportunityRow(sampleRow());
    expect(opportunity.deadline).toBe("2026-12-31");
    expect(opportunity.countryEligibility).toEqual(["ET"]);
    expect(opportunity.educationRequirements).toEqual(["university_student"]);
    expect(opportunity.sourceUrl).toBe("https://example.invalid/source");
    expect(opportunity.applicationUrl).toBe("https://example.invalid/apply");
    expect(opportunity.verificationStatus).toBe(VerificationStatus.NEEDS_REVIEW);
    expect(opportunity.lastVerifiedAt).toBeNull();
  });

  it("rejects a type that is not in the locked contract", () => {
    expect(() => mapOpportunityRow(sampleRow({ type: "scrape" }))).toThrow(/locked contract value/);
  });
});
