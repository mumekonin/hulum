import { describe, expect, it } from "vitest";
import { extractOpportunities } from "./extract.js";

describe("investigator extract", () => {
  it("drops rows that guess a type or omit evidence", async () => {
    const chat = {
      complete: async () =>
        JSON.stringify({
          opportunities: [
            {
              title: "Guessed job",
              organization: "Unknown",
              type: "not-a-type",
              description: "x",
              deadline: "2026-12-31",
              officialSourceUrl: "https://hetriil.moe.gov.et/x",
              deadlineEvidence: "Deadline 31 December 2026.",
              requirementEvidence: "Applicants must be students.",
            },
          ],
        }),
    };
    await expect(extractOpportunities(chat, "page")).resolves.toEqual([]);
  });

  it("keeps a complete extracted row", async () => {
    const chat = {
      complete: async () =>
        JSON.stringify({
          opportunities: [
            {
              title: "HETRIIL internship",
              organization: "Ministry of Education",
              type: "internship",
              description: "National internship listing.",
              deadline: "2026-12-31",
              countryEligibility: ["ET"],
              officialSourceUrl: "https://hetriil.moe.gov.et/internships",
              applicationUrl: "https://hetriil.moe.gov.et/internships",
              deadlineEvidence: "Deadline 31 December 2026.",
              requirementEvidence: "Open to enrolled students.",
            },
          ],
        }),
    };
    const rows = await extractOpportunities(chat, "page");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe("HETRIIL internship");
  });
});
