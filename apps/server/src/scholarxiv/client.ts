import { HttpError } from "../http/errors.js";

/** Official Papers API base. Docs: https://scholarxiv.com/developers/docs/papers-api */
export const SCHOLARXIV_PAPERS_SEARCH_URL = "https://scholarxiv.com/api/v1/papers/search";

const MIN_QUERY = 3;
const MAX_QUERY = 200;
const DEFAULT_LIMIT = 8;

export type ScholarxivPaper = {
  id: string;
  extractedID: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfLink: string;
  doi: string | null;
  primaryCategory: string;
};

export type ScholarxivSearchResult = {
  papers: ScholarxivPaper[];
  page: number;
  hasMore: boolean;
};

type ScholarxivSearchResponse = {
  data?: unknown;
  pagination?: {
    page?: number;
    hasMore?: boolean;
  };
};

export function normalizeSearchQuery(raw: string): string {
  const query = raw.trim().replace(/\s+/g, " ");
  if (query.length < MIN_QUERY) {
    throw new HttpError(400, "INVALID_INPUT", "Enter at least 3 characters to search ScholarXIV.");
  }
  if (query.length > MAX_QUERY) {
    throw new HttpError(400, "INVALID_INPUT", "Search query is too long.");
  }
  return query;
}

async function scholarxivError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim() !== "") {
      return payload.error.trim();
    }
  } catch {
    return "ScholarXIV returned 401.";
  }
  return "ScholarXIV returned 401.";
}

function asText(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

function mapPaper(value: unknown): ScholarxivPaper | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const row = value as Record<string, unknown>;
  const id = asText(row.id);
  const extractedID = asText(row.extractedID);
  const title = asText(row.title);
  const summary = asText(row.summary);
  const published = asText(row.published);
  const pdfLink = asText(row.pdfLink);
  const primaryCategory = asText(row.primaryCategory);
  if (
    id === undefined ||
    extractedID === undefined ||
    title === undefined ||
    summary === undefined ||
    published === undefined ||
    pdfLink === undefined ||
    primaryCategory === undefined
  ) {
    return undefined;
  }
  const authors = Array.isArray(row.authors)
    ? row.authors.filter((item): item is string => typeof item === "string" && item.trim() !== "")
    : [];
  return {
    id,
    extractedID,
    title,
    summary,
    authors,
    published,
    pdfLink,
    doi: asText(row.doi) ?? null,
    primaryCategory,
  };
}

export async function searchScholarxivPapers(input: {
  apiKey: string;
  query: string;
  page?: number;
  fetchImpl?: typeof fetch;
}): Promise<ScholarxivSearchResult> {
  const query = normalizeSearchQuery(input.query);
  const page = input.page ?? 0;
  const fetchImpl = input.fetchImpl ?? fetch;
  const url = new URL(SCHOLARXIV_PAPERS_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(DEFAULT_LIMIT));

  const apiKey = input.apiKey.trim();
  let response: Response;
  try {
    response = await fetchImpl(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
    });
    if (response.status === 401) {
      response = await fetchImpl(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          accept: "application/json",
        },
      });
    }
  } catch {
    throw new HttpError(503, "RESEARCH_UNAVAILABLE", "ScholarXIV search is unavailable.");
  }

  if (response.status === 429) {
    throw new HttpError(429, "RATE_LIMITED", "ScholarXIV rate limit reached. Try again shortly.");
  }
  if (response.status === 401) {
    const detail = await scholarxivError(response);
    throw new HttpError(503, "RESEARCH_UNAVAILABLE", `ScholarXIV rejected the server key. ${detail}`);
  }
  if (!response.ok) {
    throw new HttpError(503, "RESEARCH_UNAVAILABLE", "ScholarXIV search is unavailable.");
  }

  const payload = (await response.json()) as ScholarxivSearchResponse;
  const papers = Array.isArray(payload.data)
    ? payload.data.map(mapPaper).filter((item): item is ScholarxivPaper => item !== undefined)
    : [];

  return {
    papers,
    page: typeof payload.pagination?.page === "number" ? payload.pagination.page : page,
    hasMore: payload.pagination?.hasMore === true,
  };
}
