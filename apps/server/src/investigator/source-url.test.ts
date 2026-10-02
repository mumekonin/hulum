import { describe, expect, it } from "vitest";
import { KNOWN_LEAD_HOSTS, resolveSourceUrl, urlGroundedOnPage } from "./source-url.js";

describe("KNOWN_LEAD_HOSTS", () => {
  it("treats Afriwork as a lead host", () => {
    expect(KNOWN_LEAD_HOSTS).toContain("afriworket.com");
  });
});

describe("resolveSourceUrl", () => {
  it("prefers a non-aggregator official URL", () => {
    expect(
      resolveSourceUrl(
        "https://a2sv.org/apply",
        "https://scholarship.et/a2sv",
        KNOWN_LEAD_HOSTS,
      ),
    ).toBe("https://a2sv.org/apply");
  });

  it("keeps the fetched aggregator page when that is the listing", () => {
    expect(
      resolveSourceUrl(
        "https://scholarship.et/a2sv",
        "https://scholarship.et/a2sv",
        KNOWN_LEAD_HOSTS,
      ),
    ).toBe("https://scholarship.et/a2sv");
  });
});

describe("urlGroundedOnPage", () => {
  it("accepts the fetched page and rejects an invented host", () => {
    const text = "Apply at the listing. Deadline 31 December 2026.";
    expect(urlGroundedOnPage("https://scholarship.et/a2sv", text, "https://scholarship.et/a2sv")).toBe(true);
    expect(urlGroundedOnPage("https://not-on-page.example/x", text, "https://scholarship.et/a2sv")).toBe(false);
  });
});
