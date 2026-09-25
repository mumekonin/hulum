import type { Profile } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { analyzeScreenshotExtract } from "./screenshotAnalyze.js";
import { EMPTY_SCREENSHOT_EXTRACT } from "./screenshotExtract.js";

const clock = { now: () => new Date("2026-09-25T00:00:00.000Z") };

const profile: Profile = {
  id: "11111111-1111-4111-8111-111111111111",
  userId: "11111111-1111-4111-8111-111111111111",
  educationLevel: "bachelor_in_progress",
  fieldOfStudy: "Computer Science",
  graduationYear: 2027,
  country: "Ethiopia",
  city: "Addis Ababa",
  languages: ["English"],
  skills: ["Python"],
  experience: "One internship",
  interests: ["internships"],
  createdAt: "2026-09-25T00:00:00.000Z",
  updatedAt: "2026-09-25T00:00:00.000Z",
};

describe("screenshot analyze", () => {
  it("does not decide when title or description is missing", () => {
    const result = analyzeScreenshotExtract({ ...EMPTY_SCREENSHOT_EXTRACT, title: "Only a title" }, profile, clock);
    expect(result.canDecide).toBe(false);
    expect(result.decision).toBeNull();
  });

  it("runs decide() when title, organization, and description are present", () => {
    const result = analyzeScreenshotExtract(
      {
        ...EMPTY_SCREENSHOT_EXTRACT,
        title: "Software intern",
        organization: "Example Org",
        description: "Internship in Ethiopia for CS students.",
        countryEligibility: ["Ethiopia"],
        fieldRequirements: ["Computer Science"],
      },
      profile,
      clock,
    );
    expect(result.canDecide).toBe(true);
    expect(result.decision).not.toBeNull();
    expect(["APPLY", "MAYBE", "SKIP"]).toContain(result.decision?.decision);
  });
});
