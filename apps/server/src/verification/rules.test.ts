import { OpportunityType, VerificationStatus, type Opportunity } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import type { Clock } from "../services/common/clock.js";
import {
  VERIFICATION_STALE_AFTER_DAYS,
  effectiveVerificationStatus,
  presentOpportunity,
  sourcePriority,
} from "./rules.js";

const clock: Clock = {
  now: () => new Date("2026-09-20T12:00:00.000Z"),
};

const opportunity: Opportunity = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Verification fixture",
  organization: "HULUM Test",
  type: OpportunityType.SCHOLARSHIP,
  description: "Used only in unit tests. Not a catalog seed.",
  deadline: "2026-12-31",
  countryEligibility: ["ET"],
  educationRequirements: ["university_student"],
  fieldRequirements: [],
  experienceRequirements: [],
  languageRequirements: [],
  documentRequirements: [],
  otherRequirements: [],
  applicationUrl: "https://example.invalid/apply",
  sourceUrl: "https://example.invalid/source",
  verificationStatus: VerificationStatus.VERIFIED,
  lastVerifiedAt: "2026-09-19T00:00:00.000Z",
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("sourcePriority", () => {
  it("treats sourceUrl as the eligibility authority and does not invent apply links", () => {
    const ranked = sourcePriority(opportunity);
    expect(ranked.officialSourceUrl).toBe("https://example.invalid/source");
    expect(ranked.applicationUrl).toBe("https://example.invalid/apply");
    expect(ranked.factAuthority).toBe("source_url");
    expect(ranked.applyAuthority).toBe("application_url");
  });

  it("falls back to the official source when applicationUrl is missing", () => {
    const ranked = sourcePriority({ ...opportunity, applicationUrl: "  " });
    expect(ranked.applicationUrl).toBeNull();
    expect(ranked.applyAuthority).toBe("source_url");
    expect(ranked.officialSourceUrl).toBe("https://example.invalid/source");
  });
});

describe("effectiveVerificationStatus", () => {
  it("keeps a fresh VERIFIED listing", () => {
    expect(effectiveVerificationStatus(opportunity, clock)).toBe(VerificationStatus.VERIFIED);
  });

  it("marks a past deadline EXPIRED even when stored as VERIFIED", () => {
    expect(effectiveVerificationStatus({ ...opportunity, deadline: "2026-01-01" }, clock)).toBe(
      VerificationStatus.EXPIRED,
    );
  });

  it("keeps stored EXPIRED when the printed deadline is still in the future", () => {
    expect(
      effectiveVerificationStatus(
        { ...opportunity, verificationStatus: VerificationStatus.EXPIRED },
        clock,
      ),
    ).toBe(VerificationStatus.EXPIRED);
  });

  it("treats VERIFIED with no lastVerifiedAt as NEEDS_REVIEW", () => {
    expect(effectiveVerificationStatus({ ...opportunity, lastVerifiedAt: null }, clock)).toBe(
      VerificationStatus.NEEDS_REVIEW,
    );
  });

  it("treats VERIFIED older than the stale window as NEEDS_REVIEW", () => {
    expect(VERIFICATION_STALE_AFTER_DAYS).toBe(30);
    expect(
      effectiveVerificationStatus(
        { ...opportunity, lastVerifiedAt: "2026-08-01T00:00:00.000Z" },
        clock,
      ),
    ).toBe(VerificationStatus.NEEDS_REVIEW);
  });

  it("treats a future lastVerifiedAt as NEEDS_REVIEW", () => {
    expect(
      effectiveVerificationStatus(
        { ...opportunity, lastVerifiedAt: "2026-09-21T00:00:00.000Z" },
        clock,
      ),
    ).toBe(VerificationStatus.NEEDS_REVIEW);
  });

  it("does not invent a source URL; empty source is NEEDS_REVIEW", () => {
    expect(effectiveVerificationStatus({ ...opportunity, sourceUrl: "   " }, clock)).toBe(
      VerificationStatus.NEEDS_REVIEW,
    );
  });

  it("presents effective status without changing lastVerifiedAt", () => {
    const presented = presentOpportunity({ ...opportunity, deadline: "2026-01-01" }, clock);
    expect(presented.verificationStatus).toBe(VerificationStatus.EXPIRED);
    expect(presented.lastVerifiedAt).toBe("2026-09-19T00:00:00.000Z");
    expect(presented.sourceUrl).toBe("https://example.invalid/source");
  });
});
