import { OpportunityType, VerificationStatus, type Opportunity } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import type { Clock } from "../services/common/clock.js";
import { createOpportunityService } from "./service.js";
import type { OpportunityStore } from "./store.js";

const clock: Clock = {
  now: () => new Date("2026-09-20T12:00:00.000Z"),
};

const verified: Opportunity = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Service fixture",
  organization: "HULUM Test",
  type: OpportunityType.FELLOWSHIP,
  description: "Used only in unit tests. Not a catalog seed.",
  deadline: "2026-01-01",
  countryEligibility: ["ET"],
  educationRequirements: [],
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

describe("opportunity service", () => {
  it("returns effective EXPIRED without writing to the store", async () => {
    let listed = false;
    const store: OpportunityStore = {
      async list() {
        listed = true;
        return [verified];
      },
      async getById() {
        return verified;
      },
    };

    const service = createOpportunityService(store, clock);
    const [row] = await service.list();
    const one = await service.getById(verified.id);

    expect(listed).toBe(true);
    expect(row?.verificationStatus).toBe(VerificationStatus.EXPIRED);
    expect(one?.verificationStatus).toBe(VerificationStatus.EXPIRED);
    expect(one?.lastVerifiedAt).toBe(verified.lastVerifiedAt);
  });
});
