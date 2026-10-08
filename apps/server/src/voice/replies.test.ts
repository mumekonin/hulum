import { describe, expect, it } from "vitest";
import { formatSpokenReasons, replyAnalysis } from "./replies.js";

describe("spoken reasoning", () => {
  it("says why each compared requirement is met or not", () => {
    const reply = replyAnalysis("en", "Audio specialist", "MAYBE", 62, "Confirm the deadline.", {
      summary: "Some requirements are still uncertain.",
      checks: [
        {
          text: "Field of study",
          status: "MET",
          reason: "Field of study overlaps the stated requirement.",
        },
        {
          text: "Country",
          status: "UNCERTAIN",
          reason: "Country eligibility cannot be confirmed without a profile country.",
        },
      ],
      sourceUrl: "https://example.invalid/listing",
    });

    expect(reply).toContain("MAYBE for Audio specialist");
    expect(reply).toContain("Field of study is met");
    expect(reply).toContain("overlaps the stated requirement");
    expect(reply).toContain("Country is uncertain");
    expect(reply).not.toContain("Missing or uncertain:");
    expect(formatSpokenReasons([])).toBe("");
  });
});
