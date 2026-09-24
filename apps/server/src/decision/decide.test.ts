import {
  Decision,
  OpportunityType,
  RequirementKey,
  VerificationStatus,
  type Opportunity,
  type Profile,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import type { Clock } from "../services/common/clock.js";
import { decide } from "./decide.js";

const clock: Clock = {
  now: () => new Date("2026-09-19T12:00:00.000Z"),
};

const profile: Profile = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "11111111-1111-4111-8111-111111111111",
  educationLevel: "university_student",
  fieldOfStudy: "computer_science",
  graduationYear: 2027,
  country: "ET",
  city: "Addis Ababa",
  languages: ["en", "am"],
  skills: ["python"],
  experience: "1 internship",
  interests: ["ai"],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const opportunity: Opportunity = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Decision fixture",
  organization: "HULUM Test",
  type: OpportunityType.FELLOWSHIP,
  description: "Test opportunity. Not a catalog seed.",
  deadline: "2026-12-31",
  countryEligibility: ["ET", "KE"],
  educationRequirements: ["university_student"],
  fieldRequirements: ["computer_science"],
  experienceRequirements: [],
  languageRequirements: ["en"],
  documentRequirements: [],
  otherRequirements: [],
  applicationUrl: "https://example.invalid/apply",
  sourceUrl: "https://example.invalid/source",
  verificationStatus: VerificationStatus.NEEDS_REVIEW,
  lastVerifiedAt: null,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("decide", () => {
  it("returns APPLY when key requirements are MET and nothing important is uncertain", () => {
    const result = decide(profile, opportunity, clock);
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.fitScore).toBeGreaterThanOrEqual(90);
    expect(result.missingRequirements).toEqual([]);
    expect(result.uncertainRequirements).toEqual([]);
  });

  it("returns SKIP when a critical country requirement is NOT_MET", () => {
    const result = decide({ ...profile, country: "US" }, opportunity, clock);
    expect(result.decision).toBe(Decision.SKIP);
    expect(result.missingRequirements.some((item) => item.key === RequirementKey.COUNTRY)).toBe(true);
  });

  it("returns SKIP when education is a critical mismatch", () => {
    const result = decide({ ...profile, educationLevel: "high_school" }, opportunity, clock);
    expect(result.decision).toBe(Decision.SKIP);
  });

  it("returns SKIP when the deadline has passed", () => {
    const result = decide(profile, { ...opportunity, deadline: "2026-01-01" }, clock);
    expect(result.decision).toBe(Decision.SKIP);
  });

  it("returns MAYBE when a key language requirement is NOT_MET", () => {
    const result = decide(profile, { ...opportunity, languageRequirements: ["en", "fr"] }, clock);
    expect(result.decision).toBe(Decision.MAYBE);
  });

  it("returns MAYBE when the profile is incomplete", () => {
    const result = decide({ ...profile, country: null }, opportunity, clock);
    expect(result.decision).toBe(Decision.MAYBE);
    expect(result.uncertainRequirements.some((item) => item.key === RequirementKey.COUNTRY)).toBe(true);
  });

  it("still returns APPLY when experience is uncertain and key facts match", () => {
    const result = decide(profile, { ...opportunity, experienceRequirements: ["2 years"] }, clock);
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.uncertainRequirements.some((item) => item.key === RequirementKey.EXPERIENCE)).toBe(true);
  });

  it("returns MAYBE for an optional field mismatch that is not critical", () => {
    const result = decide({ ...profile, fieldOfStudy: "history" }, opportunity, clock);
    expect(result.decision).toBe(Decision.MAYBE);
  });

  it("returns SKIP when the listing is EXPIRED even if the printed deadline is open", () => {
    const result = decide(
      profile,
      { ...opportunity, verificationStatus: VerificationStatus.EXPIRED },
      clock,
    );
    expect(result.decision).toBe(Decision.SKIP);
    expect(result.reasons[0]).toMatch(/expired/i);
  });

  it("still returns APPLY for NEEDS_REVIEW when key requirements match", () => {
    const result = decide(profile, opportunity, clock);
    expect(opportunity.verificationStatus).toBe(VerificationStatus.NEEDS_REVIEW);
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.audit.rulePath).toBe("keys_met_no_uncertainty");
    expect(result.audit.fitScoreIsAdvisoryOnly).toBe(true);
    expect(result.audit.criticalNotMet).toEqual([]);
  });

  it("records critical_not_met on the audit trail for a country SKIP", () => {
    const result = decide({ ...profile, country: "US" }, opportunity, clock);
    expect(result.audit.rulePath).toBe("critical_not_met");
    expect(result.audit.criticalNotMet).toContain(RequirementKey.COUNTRY);
  });

  it("records expired_override when effective verification is EXPIRED", () => {
    const result = decide(
      profile,
      { ...opportunity, verificationStatus: VerificationStatus.EXPIRED },
      clock,
    );
    expect(result.audit.rulePath).toBe("expired_override");
    expect(result.audit.effectiveVerificationStatus).toBe(VerificationStatus.EXPIRED);
  });

  it("returns the same result for the same profile, opportunity, and clock", () => {
    expect(decide(profile, opportunity, clock)).toEqual(decide(profile, opportunity, clock));
  });
});
