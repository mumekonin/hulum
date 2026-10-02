import { describe, expect, it } from "vitest";
import { listingUrls, shouldExtractPage } from "./official-links.js";

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

  it("follows EthioScholarship sitemap locs and skips nav pages", () => {
    const sitemap = `
      <urlset>
        <loc>https://scholarship.et/scholarships</loc>
        <loc>https://scholarship.et/scholarships/hwa-scholarships-27d2c0a3</loc>
        <loc>https://scholarship.et/about</loc>
        <loc>https://scholarship.et/level/masters</loc>
      </urlset>
    `;
    const urls = listingUrls(sitemap, "https://scholarship.et/sitemap.xml");
    expect(urls).toContain("https://scholarship.et/scholarships/hwa-scholarships-27d2c0a3");
    expect(urls).toContain("https://scholarship.et/scholarships");
    expect(urls).not.toContain("https://scholarship.et/about");
    expect(urls).not.toContain("https://scholarship.et/level/masters");
  });

  it("does not follow off-host official pages that are not lead boards", () => {
    const urls = listingUrls(
      `<a href="https://www.rhodeshouse.ox.ac.uk/apply">Apply</a>
       <a href="/jobs/01e900b9-670d-41ff-968b-f041b2a1059c">Job</a>`,
      "https://afriworket.com/jobs",
    );
    expect(urls).toContain("https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c");
    expect(urls.some((item) => item.includes("rhodeshouse"))).toBe(false);
  });

  it("follows Afriwork job UUIDs from rendered HTML", () => {
    const urls = listingUrls(
      `card /jobs/01e900b9-670d-41ff-968b-f041b2a1059c apply`,
      "https://afriworket.com/jobs",
    );
    expect(urls).toContain("https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c");
  });

  it("follows catalog pagination", () => {
    const urls = listingUrls(
      `<a href="/scholarships?page=2">Next</a>`,
      "https://scholarship.et/scholarships",
    );
    expect(urls).toContain("https://scholarship.et/scholarships?page=2");
  });
});

describe("shouldExtractPage", () => {
  it("extracts an EthioScholarship detail page with a deadline signal", () => {
    expect(
      shouldExtractPage(
        "https://scholarship.et/scholarships/hwa-scholarships-27d2c0a3",
        "HWA Scholarships. Deadline 1 January 2027. Last updated Oct 1, 2026.",
      ),
    ).toBe(true);
  });

  it("extracts an Afriwork job detail with a deadline signal", () => {
    expect(
      shouldExtractPage(
        "https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c",
        "Software Development. Deadline: December 31, 2026. Intermediate experience.",
      ),
    ).toBe(true);
  });

  it("does not extract a jobs SPA shell or sitemap", () => {
    expect(shouldExtractPage("https://afriworket.com/jobs", "Explore jobs Filter Jobs Contact Us")).toBe(false);
    expect(shouldExtractPage("https://scholarship.et/sitemap.xml", "deadline last updated")).toBe(false);
  });
});
