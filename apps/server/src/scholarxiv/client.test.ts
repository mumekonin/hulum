import { describe, expect, it } from "vitest";
import { HttpError } from "../http/errors.js";
import { SCHOLARXIV_PAPERS_SEARCH_URL, searchScholarxivPapers } from "./client.js";

const sample = {
  data: [
    {
      id: "http://arxiv.org/abs/2401.01234v1",
      extractedID: "2401.01234v1",
      title: "Attention Is All You Need",
      summary: "The dominant sequence transduction models...",
      authors: ["Ashish Vaswani"],
      published: "2023-06-01T00:00:00Z",
      pdfLink: "https://arxiv.org/pdf/2401.01234v1",
      doi: "10.48550/arXiv.2401.01234",
      primaryCategory: "cs.CL",
    },
  ],
  pagination: { page: 0, limit: 8, hasMore: false, nextPage: null },
};

describe("searchScholarxivPapers", () => {
  it("calls the documented GET search and maps a paper", async () => {
    let called = "";
    const result = await searchScholarxivPapers({
      apiKey: "sxv_test",
      query: "eligibility uncertainty",
      fetchImpl: async (url) => {
        called = String(url);
        return new Response(JSON.stringify(sample), { status: 200 });
      },
    });
    expect(called.startsWith(SCHOLARXIV_PAPERS_SEARCH_URL)).toBe(true);
    expect(called).toContain("q=eligibility+uncertainty");
    expect(result.papers).toHaveLength(1);
    expect(result.papers[0]?.title).toBe("Attention Is All You Need");
    expect(result.hasMore).toBe(false);
  });

  it("rejects a short query before calling ScholarXIV", async () => {
    await expect(
      searchScholarxivPapers({
        apiKey: "sxv_test",
        query: "ai",
        fetchImpl: async () => {
          throw new Error("should not fetch");
        },
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
