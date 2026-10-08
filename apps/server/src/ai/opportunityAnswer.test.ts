import {
  Decision,
  OpportunityType,
  VerificationStatus,
  type Analysis,
  type Opportunity,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import {
  answerFromStoredFacts,
  fallbackOpportunityAnswer,
  isUnsafeOpportunityAnswer,
} from "./opportunityAnswer.js";

const opportunity: Opportunity = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Dawn scholarship",
  organization: "HULUM Test",
  type: OpportunityType.SCHOLARSHIP,
  description: "A test scholarship.",
  deadline: "2026-12-31",
  countryEligibility: ["Ethiopia"],
  educationRequirements: ["bachelor"],
  fieldRequirements: ["computer_science"],
  experienceRequirements: [],
  languageRequirements: ["en"],
  documentRequirements: ["CV", "Transcript"],
  otherRequirements: [],
  applicationUrl: "https://example.invalid/apply",
  sourceUrl: "https://example.invalid/source",
  verificationStatus: VerificationStatus.VERIFIED,
  lastVerifiedAt: "2026-09-19T00:00:00.000Z",
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const analysis: Analysis = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: "11111111-1111-4111-8111-111111111111",
  opportunityId: opportunity.id,
  decision: Decision.MAYBE,
  fitScore: 62,
  summary: "Some requirements need verification before you apply.",
  nextAction: "Verify the uncertain or missing requirements with the official source.",
  requirements: [
    {
      id: "1",
      analysisId: "44444444-4444-4444-8444-444444444444",
      key: "field",
      text: "Computer science",
      status: "UNCERTAIN",
      evidence: null,
      reason: "The profile does not include field of study, so this requirement cannot be confirmed.",
    },
  ],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("answerFromStoredFacts", () => {
  it("answers deadline and documents from the stored listing", () => {
    expect(answerFromStoredFacts("What is the deadline?", opportunity)).toContain("2026-12-31");
    expect(answerFromStoredFacts("Which documents do I need?", opportunity)).toContain("CV");
  });

  it("explains a stored MAYBE instead of a personal opinion", () => {
    const reply = answerFromStoredFacts("What do you think about this?", opportunity, analysis);
    expect(reply).toContain("MAYBE");
    expect(reply).toContain("field of study");
  });

  it("does not treat weather as a listing fact", () => {
    expect(answerFromStoredFacts("What's the weather in Addis?", opportunity)).toBeUndefined();
  });

  it("does not describe the listing when the question is about the person", () => {
    expect(answerFromStoredFacts("tell me about me based on my profile", opportunity)).toBeUndefined();
  });
});

describe("isUnsafeOpportunityAnswer", () => {
  it("rejects an invented URL", () => {
    expect(
      isUnsafeOpportunityAnswer("Apply at https://evil.invalid/now", opportunity, analysis),
    ).toBe(true);
  });

  it("keeps the official source URL", () => {
    expect(
      isUnsafeOpportunityAnswer(
        "Confirm the deadline 2026-12-31 on https://example.invalid/source",
        opportunity,
      ),
    ).toBe(false);
  });
});

describe("fallbackOpportunityAnswer", () => {
  it("includes stored requirements and the official source", () => {
    const reply = fallbackOpportunityAnswer(opportunity, analysis);
    expect(reply).toContain("Dawn scholarship");
    expect(reply).toContain("Transcript");
    expect(reply).toContain("MAYBE");
    expect(reply).toContain("example.invalid");
  });
});
