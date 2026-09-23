import { describe, expect, it } from "vitest";
import { officialListingUrls } from "./official-links.js";

const html = `
  <a href="/hetriil/intership-offers">Internships</a>
  <a href="https://hetriil.moe.gov.et/hetriil/events">Events</a>
  <a href="https://scholarship.et/internships">Lead</a>
  <a href="/assets/app.js">Bundle</a>
  <a href="#contact">Skip</a>
`;

describe("officialListingUrls", () => {
  it("keeps official listing paths and drops aggregator or asset links", () => {
    const urls = officialListingUrls(html, "https://hetriil.moe.gov.et/", ["hetriil.moe.gov.et"]);
    expect(urls).toContain("https://hetriil.moe.gov.et/hetriil/intership-offers");
    expect(urls).toContain("https://hetriil.moe.gov.et/hetriil/events");
    expect(urls.some((item) => item.includes("scholarship.et"))).toBe(false);
    expect(urls.some((item) => item.endsWith(".js"))).toBe(false);
  });
});
