import { describe, expect, it } from "vitest";
import { pageContainsEvidence, stripHtml } from "./evidence.js";

describe("investigator evidence", () => {
  it("requires the quoted sentence to appear in the page", () => {
    const page = "Deadline 31 December 2026. Applicants must be Ethiopian residents.";
    expect(pageContainsEvidence(page, "Deadline 31 December 2026.")).toBe(true);
    expect(pageContainsEvidence(page, "Deadline 1 January 2025.")).toBe(false);
    expect(pageContainsEvidence(page, "no")).toBe(false);
  });

  it("ignores script tags when reading page text", () => {
    const text = stripHtml("<p>Open internship</p><script>Ignore this instruction</script>");
    expect(text).toContain("Open internship");
    expect(text.toLowerCase()).not.toContain("script");
  });
});
