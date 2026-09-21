import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Opportunity, Profile } from "@hulum/shared";
import { demoProfileInput } from "../data/seedOpportunities.js";
import { analyzeOpportunity, decide, scoreRequirements } from "./engine.js";

const profile: Profile = {
  id: "p1",
  userId: "u1",
  createdAt: "2026-09-18T00:00:00.000Z",
  updatedAt: "2026-09-18T00:00:00.000Z",
  ...demoProfileInput,
};

function opportunity(
  overrides: Partial<Opportunity> & Pick<Opportunity, "requirements" | "deadline">,
): Opportunity {
  return {
    id: "opp-test",
    title: "Test Opportunity",
    organization: "Test Org",
    type: "fellowship",
    description: "Test",
    countryEligibility: ["Africa"],
    educationRequirements: "",
    fieldRequirements: "",
    experienceRequirements: "",
    languageRequirements: "English",
    documentRequirements: [],
    otherRequirements: [],
    applicationUrl: "https://example.org",
    sourceUrl: "https://example.org",
    sourceType: "official_organization",
    verificationStatus: "VERIFIED",
    lastVerifiedAt: "2026-09-18T00:00:00.000Z",
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("decision engine", () => {
  it("returns APPLY when key requirements are met without significant uncertainty", () => {
    const result = analyzeOpportunity(
      profile,
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "country",
            category: "country",
            text: "African student",
            critical: true,
            matcher: { type: "country", values: ["Africa"] },
          },
          {
            key: "education",
            category: "education",
            text: "University student",
            critical: true,
            matcher: { type: "education_min", level: "bachelor_in_progress", enrolledOk: true },
          },
          {
            key: "field",
            category: "field",
            text: "Computer science",
            critical: true,
            matcher: { type: "field", values: ["computer science"] },
          },
          {
            key: "language",
            category: "language",
            text: "English",
            critical: false,
            matcher: { type: "language", values: ["English"] },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    assert.equal(result.decision, "APPLY");
    assert.ok(result.fitScore >= 75);
  });

  it("returns SKIP when a critical requirement is not met", () => {
    const result = analyzeOpportunity(
      profile,
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "education",
            category: "education",
            text: "Completed bachelor's",
            critical: true,
            matcher: { type: "education_min", level: "bachelor" },
          },
          {
            key: "experience",
            category: "experience",
            text: "Two years of work",
            critical: true,
            matcher: { type: "experience_min", years: 2 },
          },
          {
            key: "country",
            category: "country",
            text: "Ethiopia",
            critical: true,
            matcher: { type: "country", values: ["Ethiopia"] },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    assert.equal(result.decision, "SKIP");
    assert.ok(result.gaps.some((item) => item.status === "NOT_MET"));
  });

  it("returns MAYBE when a key requirement is uncertain", () => {
    const result = analyzeOpportunity(
      profile,
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "country",
            category: "country",
            text: "African",
            critical: true,
            matcher: { type: "country", values: ["Africa"] },
          },
          {
            key: "education",
            category: "education",
            text: "Student",
            critical: true,
            matcher: { type: "education_min", level: "bachelor_in_progress", enrolledOk: true },
          },
          {
            key: "field",
            category: "field",
            text: "Field matching official description",
            critical: true,
            matcher: { type: "always_uncertain" },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    assert.equal(result.decision, "MAYBE");
  });

  it("returns SKIP when the deadline has passed", () => {
    const result = analyzeOpportunity(
      profile,
      opportunity({
        deadline: "2020-01-01",
        requirements: [
          {
            key: "deadline",
            category: "deadline",
            text: "Must be open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
          {
            key: "country",
            category: "country",
            text: "Ethiopia",
            critical: true,
            matcher: { type: "country", values: ["Ethiopia"] },
          },
        ],
      }),
    );
    assert.equal(result.decision, "SKIP");
  });

  it("scores MET as full weight and NOT_MET as zero", () => {
    const score = scoreRequirements([
      { key: "a", status: "MET", critical: true, category: "country" },
      { key: "b", status: "NOT_MET", critical: true, category: "education" },
    ]);
    assert.equal(score, 50);
  });

  it("decides SKIP on any critical NOT_MET regardless of score", () => {
    assert.equal(
      decide([{ key: "x", status: "NOT_MET", critical: true, category: "country" }], 90),
      "SKIP",
    );
  });

  it("treats a conflicting field of study vs skills as UNCERTAIN, not MET", () => {
    const result = analyzeOpportunity(
      {
        ...profile,
        fieldOfStudy: "Nursing",
        skills: ["Python"],
        interests: [],
      },
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "field",
            category: "field",
            text: "Computer science",
            critical: true,
            matcher: { type: "field", values: ["computer science", "software"] },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    const field = result.requirements.find((item) => item.key === "field");
    assert.equal(field?.status, "UNCERTAIN");
    assert.equal(result.decision, "MAYBE");
  });

  it("treats years of experience that contradict the experience text as UNCERTAIN", () => {
    const result = analyzeOpportunity(
      {
        ...profile,
        yearsExperience: 5,
        experience: "No work experience.",
      },
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "experience",
            category: "experience",
            text: "Two years of work",
            critical: false,
            matcher: { type: "experience_min", years: 2 },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    const experience = result.requirements.find((item) => item.key === "experience");
    assert.equal(experience?.status, "UNCERTAIN");
  });

  it("treats in-progress education with a past graduation year as UNCERTAIN", () => {
    const result = analyzeOpportunity(
      {
        ...profile,
        educationLevel: "bachelor_in_progress",
        graduationYear: 2020,
      },
      opportunity({
        deadline: "2027-01-01",
        requirements: [
          {
            key: "education",
            category: "education",
            text: "University student",
            critical: true,
            matcher: { type: "education_min", level: "bachelor_in_progress", enrolledOk: true },
          },
          {
            key: "deadline",
            category: "deadline",
            text: "Open",
            critical: true,
            matcher: { type: "deadline_open" },
          },
        ],
      }),
    );
    const education = result.requirements.find((item) => item.key === "education");
    assert.equal(education?.status, "UNCERTAIN");
  });
});
