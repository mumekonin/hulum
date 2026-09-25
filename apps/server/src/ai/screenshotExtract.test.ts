import { describe, expect, it } from "vitest";
import { EMPTY_SCREENSHOT_EXTRACT, screenshotExtractFromModelText } from "./screenshotExtract.js";

describe("screenshot extract parse", () => {
  it("keeps only grounded fields and drops invented URLs and dates", () => {
    const parsed = screenshotExtractFromModelText(
      JSON.stringify({
        title: "Software intern",
        organization: "Example Org",
        type: "internship",
        description: "Summer internship in Addis Ababa.",
        deadline: "not-a-date",
        countryEligibility: ["Ethiopia"],
        educationRequirements: ["bachelor_in_progress"],
        fieldRequirements: ["Computer Science"],
        experienceRequirements: [],
        languageRequirements: ["English"],
        documentRequirements: ["CV"],
        applicationUrl: "apply-here",
        sourceUrl: "https://example.org/intern",
        visibleText: "Software intern at Example Org",
      }),
    );
    expect(parsed.title).toBe("Software intern");
    expect(parsed.deadline).toBeNull();
    expect(parsed.applicationUrl).toBeNull();
    expect(parsed.sourceUrl).toBe("https://example.org/intern");
    expect(parsed.type).toBe("internship");
  });

  it("returns empty fields when the model output is not JSON", () => {
    expect(screenshotExtractFromModelText("not json")).toEqual(EMPTY_SCREENSHOT_EXTRACT);
  });
});
