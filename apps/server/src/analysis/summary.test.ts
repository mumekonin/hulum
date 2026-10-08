import { Decision, RequirementKey, RequirementStatus, type RequirementMatch } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { ANALYSIS_SUMMARY, analysisSummaryFor } from "./summary.js";

const met: RequirementMatch = {
  key: RequirementKey.EDUCATION,
  text: "Bachelor's",
  status: RequirementStatus.MET,
  evidence: "educationLevel=bachelor",
  reason: "The profile education is in the opportunity list.",
};

const uncertain: RequirementMatch = {
  key: RequirementKey.FIELD,
  text: "Computer science",
  status: RequirementStatus.UNCERTAIN,
  evidence: null,
  reason: "The profile does not include field of study, so this requirement cannot be confirmed.",
};

describe("analysisSummaryFor", () => {
  it("keeps the locked headline and notice when there are no matches", () => {
    const summary = analysisSummaryFor(Decision.APPLY);
    expect(summary.startsWith(ANALYSIS_SUMMARY[Decision.APPLY])).toBe(true);
    expect(summary).toContain("Always verify final eligibility");
  });

  it("adds matcher reasons so APPLY / MAYBE / SKIP is not only a highlight", () => {
    const apply = analysisSummaryFor(Decision.APPLY, [met]);
    expect(apply).toContain("The profile education is in the opportunity list.");
    const maybe = analysisSummaryFor(Decision.MAYBE, [uncertain]);
    expect(maybe).toContain("field of study");
  });
});
