import { describe, expect, it } from "vitest";
import {
  emptyProfileExtract,
  formatProfileExtractReply,
  profileExtractFromModelText,
} from "./profileExtract.js";

describe("profileExtractFromModelText", () => {
  it("parses valid JSON proposals without inventing fields", () => {
    const result = profileExtractFromModelText(
      JSON.stringify({
        educationLevel: "bachelor_in_progress",
        fieldOfStudy: "Computer Science",
        graduationYear: 2027,
        country: "Ethiopia",
        city: "Addis Ababa",
        languages: ["English", "Amharic"],
        skills: ["Python"],
        experience: "One internship",
        interests: ["AI"],
      }),
    );
    expect(result.confirmationRequired).toBe(true);
    expect(result.filledFields).toContain("fieldOfStudy");
    expect(result.proposed.country).toBe("Ethiopia");
    expect(formatProfileExtractReply(result)).toContain("not saved");
  });

  it("returns an empty proposal for malformed or invented-shape output", () => {
    expect(profileExtractFromModelText("not json").filledFields).toEqual([]);
    expect(profileExtractFromModelText('{"graduationYear":9999}').filledFields).toEqual([]);
    expect(emptyProfileExtract().confirmationRequired).toBe(true);
  });
});
