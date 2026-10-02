import { describe, expect, it } from "vitest";
import { shouldRenderInBrowser } from "./render-page.js";

const jobId = "01e900b9-670d-41ff-968b-f041b2a1059c";

describe("shouldRenderInBrowser", () => {
  it("renders Afriwork Explore jobs when the HTML has no job posts", () => {
    expect(shouldRenderInBrowser("https://afriworket.com/jobs", "<nav>Explore jobs</nav>")).toBe(true);
  });

  it("does not render after job posts are already in the HTML", () => {
    expect(
      shouldRenderInBrowser(
        "https://afriworket.com/jobs",
        `<a href="/jobs/${jobId}">Software Development</a>`,
      ),
    ).toBe(false);
  });

  it("renders an Afriwork job post when the static HTML has no deadline", () => {
    expect(
      shouldRenderInBrowser(
        `https://afriworket.com/jobs/${jobId}`,
        "<html><body>Afriwork Ethiopia</body></html>",
      ),
    ).toBe(true);
  });

  it("does not render scholarship.et or Afriwork sitemap", () => {
    expect(shouldRenderInBrowser("https://scholarship.et/scholarships", "<html></html>")).toBe(false);
    expect(shouldRenderInBrowser("https://afriworket.com/sitemap.xml", "<urlset></urlset>")).toBe(false);
  });
});
