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
      analyses: { analyze: async () => {
        throw new Error("unused");
      }, getById: async () => undefined },
      clock,
    });
    const session = await service.createSession(profile.userId, "en");
    expect(session.provider).toBe("text-fallback");
    expect(session.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("proposes profile extract without saving when chat is available", async () => {
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
      chat: {
        complete: async () =>
          JSON.stringify({
            educationLevel: null,
            fieldOfStudy: "Computer Science",
            graduationYear: null,
            country: "Ethiopia",
            city: "Addis Ababa",
            languages: [],
            skills: [],
            experience: null,
            interests: [],
          }),
      },
    });

    const result = await service.handleAction({
      userId: profile.userId,
      text: "Extract profile from this: I study CS in Addis Ababa, Ethiopia",
      language: "en",
    });
    expect(result.intent).toBe("UPDATE_PROFILE");
    expect(result.reply).toMatch(/Proposed profile facts \(not saved yet\)/);
    expect(result.reply).toContain("fieldOfStudy");
    expect(result.reply).toMatch(/not saved|confirm/i);
  });

  it("lists profile gaps without inventing facts", async () => {
    const incomplete: ProfileView = {
      ...profileView,
      completeness: { complete: false, missing: ["city", "skills"] },
    };
    const service = createVoiceService({
      profiles: { getByUserId: async () => incomplete },
      opportunities: { list: async () => [], getById: async () => undefined },
      analyses: {
        analyze: async () => {
          throw new Error("unused");
        },
        getById: async () => undefined,
      },
      clock,
    });

    const result = await service.handleAction({
      userId: profile.userId,
      text: "What is missing from my profile?",
      language: "en",
    });
    expect(result.intent).toBe("UPDATE_PROFILE");
    expect(result.reply).toContain("city");
    expect(result.reply).toContain("skills");
    expect(result.reply).toContain("Voice cannot silently change stored facts");
  });

  it("lists scholarships then analyzes the first one against the profile", async () => {
    const scholarship: Opportunity = {
      ...opportunity,
      id: "55555555-5555-4555-8555-555555555555",
      title: "Dawn scholarship",
      type: OpportunityType.SCHOLARSHIP,
    };
    const created: Analysis = {
      id: "66666666-6666-4666-8666-666666666666",
      userId: profile.userId,
      opportunityId: scholarship.id,
      decision: Decision.MAYBE,
      fitScore: 62,
      summary: "Some requirements are still uncertain.",
      nextAction: "Confirm the official source before applying.",
      requirements: [],
      readiness: [],
      createdAt: "2026-09-21T00:00:00.000Z",
      updatedAt: "2026-09-21T00:00:00.000Z",
    };
    const service = createVoiceService({
      profiles: { getByUserId: async () => profileView },
      opportunities: {
        list: async () => [opportunity, scholarship],
        getById: async (id) => (id === scholarship.id ? scholarship : opportunity),
      },
      analyses: {
        analyze: async (id) => {
          expect(id).toBe(scholarship.id);
          return created;
        },
        getById: async () => undefined,
      },
      clock,
    });

    const result = await service.handleAction({
      userId: profile.userId,
      text: "show me scholarship and analysis based on my profile",
      language: "en",
    });
    expect(result.intent).toBe("ANALYZE_OPPORTUNITY");
    expect(result.opportunity?.id).toBe(scholarship.id);
    expect(result.opportunities?.some((item) => item.type === OpportunityType.SCHOLARSHIP)).toBe(true);
    expect(result.reply).toMatch(/Scholarship/i);
    expect(result.reply).toMatch(/MAYBE/);
    expect(result.reply).toMatch(/Dawn scholarship/);
    expect(result.reply).toMatch(/Some requirements are still uncertain/);
  });

  it("answers details in Afaan Oromo when the user asks in Oromo", async () => {
    const created: Analysis = {
      id: "77777777-7777-4777-8777-777777777777",
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.APPLY,
      fitScore: 90,
      summary: "You meet the key known requirements.",
      nextAction: "Prepare your application materials.",
      requirements: [],
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
      text: "carraa kana ibsi",
      language: "en",
      opportunityId: opportunity.id,
      analysisId: created.id,
    });
    expect(result.intent).toBe("OPEN_OPPORTUNITY");
    expect(result.reply).toMatch(/Gosa|Guyyaa xumuraa|Madda|Murteen kuufame/);
  });
});
