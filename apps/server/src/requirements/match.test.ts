import {
  OpportunityType,
  RequirementKey,
  RequirementStatus,
  VerificationStatus,
  type Opportunity,
  type Profile,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import type { Clock } from "../services/common/clock.js";
import { matchRequirements } from "./match.js";

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
  title: "Matcher fixture",
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

function status(matches: ReturnType<typeof matchRequirements>, key: string): string {
  const row = matches.find((item) => item.key === key);
  if (row === undefined) {
    throw new Error(`missing key ${key}`);
  }
  return row.status;
}

describe("matchRequirements", () => {
  it("returns MET for structured facts that appear in the opportunity lists", () => {
    const result = matchRequirements(profile, opportunity, clock);
    expect(status(result, RequirementKey.COUNTRY)).toBe(RequirementStatus.MET);
    expect(status(result, RequirementKey.EDUCATION)).toBe(RequirementStatus.MET);
    expect(status(result, RequirementKey.FIELD)).toBe(RequirementStatus.MET);
    expect(status(result, RequirementKey.LANGUAGE)).toBe(RequirementStatus.MET);
    expect(status(result, RequirementKey.DEADLINE)).toBe(RequirementStatus.MET);
    expect(status(result, RequirementKey.EXPERIENCE)).toBe(RequirementStatus.NOT_APPLICABLE);
    expect(status(result, RequirementKey.DOCUMENTS)).toBe(RequirementStatus.NOT_APPLICABLE);
  });

  it("returns NOT_MET for a country that is not listed", () => {
    const result = matchRequirements({ ...profile, country: "US" }, opportunity, clock);
    expect(status(result, RequirementKey.COUNTRY)).toBe(RequirementStatus.NOT_MET);
  });

  it("returns UNCERTAIN when the profile country is missing", () => {
    const result = matchRequirements({ ...profile, country: null }, opportunity, clock);
    expect(status(result, RequirementKey.COUNTRY)).toBe(RequirementStatus.UNCERTAIN);
  });

  it("returns NOT_MET for an education mismatch", () => {
    const result = matchRequirements(
      { ...profile, educationLevel: "high_school" },
      opportunity,
      clock,
    );
    expect(status(result, RequirementKey.EDUCATION)).toBe(RequirementStatus.NOT_MET);
  });

  it("returns NOT_MET when a required language is missing", () => {
    const result = matchRequirements(
      profile,
      { ...opportunity, languageRequirements: ["en", "fr"] },
      clock,
    );
    expect(status(result, RequirementKey.LANGUAGE)).toBe(RequirementStatus.NOT_MET);
  });

  it("returns UNCERTAIN for experience text instead of guessing MET", () => {
    const result = matchRequirements(
      profile,
      { ...opportunity, experienceRequirements: ["2 years"] },
      clock,
    );
    expect(status(result, RequirementKey.EXPERIENCE)).toBe(RequirementStatus.UNCERTAIN);
  });

  it("returns UNCERTAIN for document requirements because the profile has no document facts", () => {
    const result = matchRequirements(
      profile,
      { ...opportunity, documentRequirements: ["cv"] },
      clock,
    );
    expect(status(result, RequirementKey.DOCUMENTS)).toBe(RequirementStatus.UNCERTAIN);
  });

  it("returns NOT_MET when the deadline is before today", () => {
    const result = matchRequirements(profile, { ...opportunity, deadline: "2026-01-01" }, clock);
    expect(status(result, RequirementKey.DEADLINE)).toBe(RequirementStatus.NOT_MET);
  });

  it("is deterministic for the same profile, opportunity, and clock", () => {
    const first = matchRequirements(profile, opportunity, clock);
    const second = matchRequirements(profile, opportunity, clock);
    expect(first).toEqual(second);
  });

  it("returns UNCERTAIN when field of study conflicts with skills that match the requirement", () => {
    const result = matchRequirements(
      { ...profile, fieldOfStudy: "nursing", skills: ["computer_science"], interests: [] },
      opportunity,
      clock,
    );
    expect(status(result, RequirementKey.FIELD)).toBe(RequirementStatus.UNCERTAIN);
  });

  it("returns UNCERTAIN when years of experience conflict with no-experience text", () => {
    const result = matchRequirements(
      { ...profile, yearsExperience: 5, experience: "No work experience." },
      { ...opportunity, experienceRequirements: ["2 years"] },
      clock,
    );
    expect(status(result, RequirementKey.EXPERIENCE)).toBe(RequirementStatus.UNCERTAIN);
    const row = result.find((item) => item.key === RequirementKey.EXPERIENCE);
    expect(row?.reason).toMatch(/conflict/i);
  });

  it("returns UNCERTAIN when in-progress education conflicts with a past graduation year", () => {
    const result = matchRequirements(
      { ...profile, educationLevel: "bachelor_in_progress", graduationYear: 2020 },
      { ...opportunity, educationRequirements: ["bachelor_in_progress"] },
      clock,
    );
    expect(status(result, RequirementKey.EDUCATION)).toBe(RequirementStatus.UNCERTAIN);
  });
});
