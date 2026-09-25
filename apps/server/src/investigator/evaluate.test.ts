import { describe, expect, it } from "vitest";
import { evaluateExtracted } from "./run.js";

const now = new Date("2026-09-22T12:00:00.000Z");
const page =
  "HETRIIL internship is open. Deadline 31 December 2026. Open to enrolled students in Ethiopia.";

const valid = {
  title: "HETRIIL internship",
  deadline: "2026-12-31",
  officialSourceUrl: "https://hetriil.moe.gov.et/internships",
  applicationUrl: "https://hetriil.moe.gov.et/internships/apply",
  deadlineEvidence: "Deadline 31 December 2026.",
  requirementEvidence: "Open to enrolled students in Ethiopia.",
};

describe("evaluateExtracted", () => {
  it("accepts an evidenced official row", () => {
    expect(evaluateExtracted(valid, page, "https://hetriil.moe.gov.et/internships", now)).toBeUndefined();
  });

  it("accepts an evidenced aggregator listing page", () => {
    expect(
      evaluateExtracted(
        { ...valid, officialSourceUrl: "https://scholarship.et/listing", applicationUrl: null },
        page,
        "https://scholarship.et/listing",
        now,
      ),
    ).toBeUndefined();
  });

  it("rejects a URL that was not on the fetched page", () => {
    expect(
      evaluateExtracted(valid, page, "https://scholarship.et/listing", now),
    ).toMatch(/source URL was not on the fetched page/);
  });

  it("rejects invented deadline evidence", () => {
    expect(
      evaluateExtracted(
        { ...valid, deadlineEvidence: "Deadline 1 January 2025." },
        page,
        "https://hetriil.moe.gov.et/internships",
        now,
      ),
    ).toMatch(/deadline evidence/);
  });
});
