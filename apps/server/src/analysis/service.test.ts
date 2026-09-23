import {
  Decision,
  Language,
  OpportunityType,
  ReadinessStatus,
  VerificationStatus,
  type Analysis,
  type Opportunity,
  type Profile,
  type ProfileView,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { HttpError } from "../http/errors.js";
import type { Clock } from "../services/common/clock.js";
import { createAnalysisService } from "./service.js";
import type { AnalysisStore, PersistAnalysisInput as StoreInput } from "./store.js";
import { ANALYSIS_SUMMARY, analysisSummaryFor } from "./summary.js";

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

const view: ProfileView = {
  name: "Test User",
  email: "test@example.invalid",
  profile,
  completeness: { complete: true, missing: [] },
};

const opportunity: Opportunity = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Analysis fixture",
  organization: "HULUM Test",
  type: OpportunityType.FELLOWSHIP,
  description: "Used only in unit tests. Not a catalog seed.",
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

function storedFrom(input: StoreInput): Analysis {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    userId: input.userId,
    opportunityId: input.opportunityId,
    decision: input.decision,
    fitScore: input.fitScore,
    summary: input.summary,
    requirements: input.matches.map((match, index) => ({
      id: `55555555-5555-4555-8555-55555555555${String(index)}`,
      analysisId: "44444444-4444-4444-8444-444444444444",
      key: match.key,
      text: match.text,
      status: match.status,
      evidence: match.evidence,
      reason: match.reason,
    })),
    nextAction: "Prepare your application materials and verify the official source.",
    audit: input.audit,
    readiness: input.readiness.map((draft, index) => ({
      id: `66666666-6666-4666-8666-66666666666${String(index)}`,
      analysisId: "44444444-4444-4444-8444-444444444444",
      title: draft.title,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      createdAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:00:00.000Z",
    })),
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  };
}

const stubAudit = {
  rulePath: "default_maybe" as const,
  criticalKeys: ["country", "education", "deadline"],
  keyRequirementKeys: ["country", "education", "deadline", "field", "language"],
  criticalNotMet: [] as string[],
  keyStatuses: {},
  uncertainKeys: [] as string[],
  effectiveVerificationStatus: VerificationStatus.NEEDS_REVIEW,
  fitScoreIsAdvisoryOnly: true as const,
  decidedAt: "2026-09-19T12:00:00.000Z",
};

describe("analysis service", () => {
  it("persists a complete structured analysis from decide()", async () => {
    let persisted: StoreInput | undefined;
    const store: AnalysisStore = {
      async create(input) {
        persisted = input;
        return storedFrom(input);
      },
      async getById() {
        return undefined;
      },
    };

    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: { getById: async () => opportunity },
      store,
      clock,
    });

    const result = await service.analyze(opportunity.id, profile.userId);
    expect(persisted).toBeDefined();
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.fitScore).toBeGreaterThanOrEqual(90);
    expect(result.summary).toBe(analysisSummaryFor(Decision.APPLY));
    expect(result.summary.startsWith(ANALYSIS_SUMMARY[Decision.APPLY])).toBe(true);
    expect(result.summary.includes("Always verify final eligibility")).toBe(true);
    expect(result.requirements.length).toBeGreaterThan(0);
    expect(result.readiness.length).toBeGreaterThan(0);
    expect(result.readiness[0]?.title).toBe("No extra documents listed");
    expect(persisted?.userId).toBe(profile.userId);
    expect(persisted?.opportunityId).toBe(opportunity.id);
    expect(persisted?.summary).toBe(analysisSummaryFor(Decision.APPLY));
    expect(persisted?.audit.rulePath).toBe("keys_met_no_uncertainty");
    expect(result.audit?.rulePath).toBe("keys_met_no_uncertainty");
  });

  it("persists SKIP when the opportunity is EXPIRED", async () => {
    let persisted: StoreInput | undefined;
    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: {
        getById: async () => ({
          ...opportunity,
          verificationStatus: VerificationStatus.EXPIRED,
        }),
      },
      store: {
        async create(input) {
          persisted = input;
          return storedFrom(input);
        },
        async getById() {
          return undefined;
        },
      },
      clock,
    });

    const result = await service.analyze(opportunity.id, profile.userId);
    expect(result.decision).toBe(Decision.SKIP);
    expect(persisted?.decision).toBe(Decision.SKIP);
    expect(persisted?.audit.rulePath).toBe("expired_override");
    expect(result.summary).toBe(analysisSummaryFor(Decision.SKIP));
  });

  it("returns 404 when the profile is missing", async () => {
    const service = createAnalysisService({
      profiles: { getByUserId: async () => undefined },
      opportunities: { getById: async () => opportunity },
      store: {
        create: async () => storedFrom({
          userId: profile.userId,
          opportunityId: opportunity.id,
          decision: Decision.MAYBE,
          fitScore: 0,
          summary: "",
          matches: [],
          readiness: [],
          audit: stubAudit,
        }),
        getById: async () => undefined,
      },
      clock,
    });

    await expect(service.analyze(opportunity.id, profile.userId)).rejects.toBeInstanceOf(HttpError);
  });

  it("explains with Groq text but keeps the stored APPLY decision", async () => {
    const stored = storedFrom({
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.APPLY,
      fitScore: 95,
      summary: ANALYSIS_SUMMARY[Decision.APPLY],
      matches: [],
      readiness: [],
      audit: stubAudit,
    });
    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: { getById: async () => opportunity },
      store: {
        create: async () => stored,
        getById: async () => stored,
      },
      clock,
      chat: {
        complete: async () => "This opportunity is a SKIP.",
      },
    });

    const result = await service.explain(stored.id, Language.ENGLISH);
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.explanation).toBe(`${stored.summary} ${stored.nextAction}`.trim());
    expect(result.explanation.includes("This opportunity is a SKIP.")).toBe(false);
  });

  it("replaces an empty Groq reply with the stored fallback", async () => {
    const stored = storedFrom({
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.MAYBE,
      fitScore: 40,
      summary: ANALYSIS_SUMMARY[Decision.MAYBE],
      matches: [],
      readiness: [],
      audit: stubAudit,
    });
    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: { getById: async () => opportunity },
      store: {
        create: async () => stored,
        getById: async () => stored,
      },
      clock,
      chat: {
        complete: async () => {
          throw new HttpError(502, "AI_ERROR", "The explanation service returned an empty reply.");
        },
      },
    });

    const result = await service.explain(stored.id, Language.ENGLISH);
    expect(result.decision).toBe(Decision.MAYBE);
    expect(result.explanation).toBe(`${stored.summary} ${stored.nextAction}`.trim());
  });

  it("retries once after AI_ERROR and keeps the stored decision", async () => {
    const stored = storedFrom({
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.APPLY,
      fitScore: 95,
      summary: ANALYSIS_SUMMARY[Decision.APPLY],
      matches: [],
      readiness: [],
    });
    let attempts = 0;
    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: { getById: async () => opportunity },
      store: {
        create: async () => stored,
        getById: async () => stored,
      },
      clock,
      chat: {
        complete: async () => {
          attempts += 1;
          if (attempts === 1) {
            throw new HttpError(502, "AI_ERROR", "Transient Groq failure.");
          }
          return "You look ready to apply based on the stored profile facts HULUM already checked. Confirm the official source before you invest time.";
        },
      },
    });

    const result = await service.explain(stored.id, Language.ENGLISH);
    expect(attempts).toBe(2);
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.explanation).toContain("ready to apply");
    expect(result.explanation.toLowerCase()).not.toContain("skip");
  });

  it("personalizes readiness plan wording without inventing checklist titles", async () => {
    const stored = storedFrom({
      userId: profile.userId,
      opportunityId: opportunity.id,
      decision: Decision.MAYBE,
      fitScore: 60,
      summary: ANALYSIS_SUMMARY[Decision.MAYBE],
      matches: [],
      readiness: [
        {
          title: "Prepare CV",
          description: null,
          status: ReadinessStatus.TODO,
          priority: 1,
        },
        {
          title: "Resolve the language requirement",
          description: null,
          status: ReadinessStatus.TODO,
          priority: 2,
        },
      ],
    });
    const service = createAnalysisService({
      profiles: { getByUserId: async () => view },
      opportunities: { getById: async () => opportunity },
      store: {
        create: async () => stored,
        getById: async () => stored,
      },
      clock,
      chat: {
        complete: async () =>
          "With a MAYBE decision, prioritize Prepare CV and Resolve the language requirement, then re-check the official source.",
      },
    });

    const result = await service.personalizedReadinessPlan(stored.id, Language.ENGLISH);
    expect(result.decision).toBe(Decision.MAYBE);
    expect(result.plan).toContain("Prepare CV");
    expect(result.plan).toContain("Resolve the language requirement");
    expect(result.items).toHaveLength(2);
  });
});
