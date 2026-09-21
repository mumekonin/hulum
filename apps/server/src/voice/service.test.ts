import {
  Decision,
  OpportunityType,
  RequirementStatus,
  VerificationStatus,
  type Opportunity,
  type Profile,
  type ProfileView,
  type Analysis,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { createVoiceService } from "./index.js";

const clock = { now: () => new Date("2026-09-21T12:00:00.000Z") };

const profile: Profile = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "11111111-1111-4111-8111-111111111111",
  educationLevel: "university_student",
  fieldOfStudy: "computer_science",
  graduationYear: 2027,
  country: "ET",
  city: "Addis Ababa",
  languages: ["en"],
  skills: ["python"],
  experience: "internship",
  interests: ["ai"],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const opportunity: Opportunity = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Voice fixtures",
  organization: "HULUM Test",
  type: OpportunityType.INTERNSHIP,
  description: "Test opportunity.",
  deadline: "2026-12-31",
  countryEligibility: ["ET"],
  educationRequirements: ["university_student"],
  fieldRequirements: ["computer_science"],
  experienceRequirements: [],
  languageRequirements: ["en"],
  documentRequirements: [],
  otherRequirements: [],
  applicationUrl: "https://example.invalid/apply",
  sourceUrl: "https://example.invalid/source",
  verificationStatus: VerificationStatus.VERIFIED,
  lastVerifiedAt: "2026-09-19T00:00:00.000Z",
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const profileView: ProfileView = {
  name: "Abeba",
  email: "abeba@example.invalid",
  profile,
  completeness: { complete: true, missing: [] },
};

describe("createVoiceService", () => {
  it("lists opportunities without analyzing", async () => {
    const service = createVoiceService({
      profiles: { getByUserId: async () => profileView },
      opportunities: {
        list: async () => [opportunity],
        getById: async () => opportunity,
      },
      analyses: {
        analyze: async () => {
          throw new Error("analyze should not run");
        },
        getById: async () => undefined,
      },
      clock,
    });

    const result = await service.handleAction({
      userId: profile.userId,
      text: "Show me opportunities",
      language: "en",
    });
    expect(result.intent).toBe("SHOW_OPPORTUNITIES");
    expect(result.opportunities).toHaveLength(1);
  });

  it("analyzes through the analysis service", async () => {
    const created: Analysis = {
      id: "44444444-4444-4444-8444-444444444444",
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.APPLY,
      fitScore: 90,
      summary: "You meet the key known requirements.",
      nextAction: "Prepare your application materials and verify the official source.",
      requirements: [
        {
          id: "r1",
          analysisId: "44444444-4444-4444-8444-444444444444",
          key: "country",
          text: "ET",
          status: RequirementStatus.MET,
          evidence: "country=ET",
          reason: "ok",
        },
      ],
      readiness: [],
      createdAt: "2026-09-21T00:00:00.000Z",
      updatedAt: "2026-09-21T00:00:00.000Z",
    };

    const service = createVoiceService({
      profiles: { getByUserId: async () => profileView },
      opportunities: {
        list: async () => [opportunity],
        getById: async () => opportunity,
      },
      analyses: {
        analyze: async () => created,
        getById: async () => created,
      },
      clock,
    });

    const result = await service.handleAction({
      userId: profile.userId,
      text: "Should I apply for this?",
      language: "en",
      opportunityId: opportunity.id,
    });
    expect(result.intent).toBe("ANALYZE_OPPORTUNITY");
    expect(result.analysis?.decision).toBe(Decision.APPLY);
    expect(result.reply).toMatch(/APPLY/);
  });

  it("creates a text-fallback session", async () => {
    const service = createVoiceService({
      profiles: { getByUserId: async () => profileView },
      opportunities: { list: async () => [], getById: async () => undefined },
      analyses: {
        analyze: async () => {
          throw new Error("unused");
        },
        getById: async () => undefined,
      },
      clock,
    });
    const session = await service.createSession(profile.userId, "en");
    expect(session.provider).toBe("text-fallback");
    expect(session.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
