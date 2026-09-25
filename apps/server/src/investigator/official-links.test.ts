import { describe, expect, it } from "vitest";
import { listingUrls } from "./official-links.js";

const html = `
  <a href="/hetriil/intership-offers">Internships</a>
  <a href="https://hetriil.moe.gov.et/hetriil/events">Events</a>
  <a href="https://scholarship.et/internships">Lead listing</a>
  <a href="/assets/app.js">Bundle</a>
  <a href="#contact">Skip</a>
`;

describe("listingUrls", () => {
  it("follows official and aggregator listing links and drops assets", () => {
    const urls = listingUrls(html, "https://hetriil.moe.gov.et/");
    expect(urls).toContain("https://hetriil.moe.gov.et/hetriil/intership-offers");
    expect(urls).toContain("https://hetriil.moe.gov.et/hetriil/events");
    expect(urls).toContain("https://scholarship.et/internships");
    expect(urls.some((item) => item.endsWith(".js"))).toBe(false);
  });
});
