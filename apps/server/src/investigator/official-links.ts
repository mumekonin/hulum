import { hostnameOf, isLeadHost, isSafePublicHttpUrl } from "./safety.js";
import { KNOWN_LEAD_HOSTS } from "./source-url.js";

const LISTING_HINT =
  /intern|intership|opportunit|scholarship|fellowship|research-call|event|vacanc|\bjobs?\b|grant|apply|deadline/i;
const SKIP_EXT = /\.(css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|map|mp4|webm)(\?|#|$)/i;
const SKIP_PATH =
  /\/(?:about|guides?|saved|auth|login|register|blog|faq|terms|tags|pricing|our-story|testimonies|recruitment|cgi-bin|_nuxt|assets)(?:\/|$)/i;
const SKIP_FILTER = /\/(?:level|funding|country|search|type)(?:\/|$)/i;
const DETAIL_PATH = /\/scholarships\/[a-z0-9][a-z0-9-]*[a-z0-9]/i;
const JOB_DETAIL_PATH =
  /\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const INDEX_PATH = /\/(?:scholarships|opportunities|internships|fellowships|jobs)\/?$/i;
const SITEMAP_PATH = /sitemap[^/]*\.xml$/i;
const MAX_LISTING_URLS = 500;

function normalizePageUrl(raw: string): string | undefined {
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function sitemapUrlFor(pageUrl: string): string | undefined {
  try {
    const parsed = new URL(pageUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return `${parsed.origin}/sitemap.xml`;
  } catch {
    return undefined;
  }
}

export function isListingDetailUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    const path = parsed.pathname;
    if (SITEMAP_PATH.test(path) || INDEX_PATH.test(path) || SKIP_PATH.test(path) || SKIP_FILTER.test(path)) {
      return false;
    }
    if (DETAIL_PATH.test(path) || JOB_DETAIL_PATH.test(path)) {
      return true;
    }
    return /\/20\d{2}\/\d{1,2}\/[\w-]+/.test(path);
  } catch {
    return false;
  }
}

export function listingFollowScore(url: string): number {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "afriworket.com" && (/\/jobs\/?$/.test(parsed.pathname) || isListingDetailUrl(url))) {
      return 5;
    }
  } catch {
    return 0;
  }
  if (isListingDetailUrl(url)) {
    return 3;
  }
  if (SITEMAP_PATH.test(url) || /[?&]page=\d+/i.test(url)) {
    return 2;
  }
  try {
    if (INDEX_PATH.test(new URL(url).pathname)) {
      return 1;
    }
  } catch {
    return 0;
  }
  return 0;
}

export function shouldExtractPage(url: string, pageText: string): boolean {
  if (/\.xml(\?|$)/i.test(url) || pageText.trim() === "") {
    return false;
  }
  if (!/(deadline|apply by|closing date|applications close|due date|last updated)/i.test(pageText)) {
    return false;
  }
  if (isListingDetailUrl(url)) {
    return true;
  }
  try {
    const path = new URL(url).pathname;
    if (INDEX_PATH.test(path) || SKIP_FILTER.test(path) || SKIP_PATH.test(path) || SITEMAP_PATH.test(path)) {
      return false;
    }
  } catch {
    return false;
  }
  return pageText.length >= 400;
}

function collectRawRefs(html: string): string[] {
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1] ?? "");
  const locs = [...html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => match[1] ?? "");
  const jsonPaths = [...html.matchAll(/["'](\/(?:scholarships|jobs|opportunities)\/[^"']+)["']/gi)].map(
    (match) => match[1] ?? "",
  );
  const jobPaths = [...html.matchAll(new RegExp(JOB_DETAIL_PATH, "gi"))].map((match) => match[0] ?? "");
  return [...hrefs, ...locs, ...jsonPaths, ...jobPaths].filter((item) => item !== "");
}

function isFollowable(resolved: URL, pageUrl: string): boolean {
  const path = resolved.pathname;
  const haystack = `${path}${resolved.search}`;
  const host = hostnameOf(resolved.toString());
  const pageHost = hostnameOf(pageUrl);
  if (host === undefined) {
    return false;
  }
  if (pageHost !== undefined && host !== pageHost && !isLeadHost(host, KNOWN_LEAD_HOSTS)) {
    return false;
  }
  if (SKIP_EXT.test(path) || SKIP_PATH.test(path) || SKIP_FILTER.test(path)) {
    return false;
  }
  if (SITEMAP_PATH.test(path) || INDEX_PATH.test(path) || DETAIL_PATH.test(path) || JOB_DETAIL_PATH.test(path)) {
    return true;
  }
  if (resolved.searchParams.has("page") && LISTING_HINT.test(haystack)) {
    return true;
  }
  return LISTING_HINT.test(haystack);
}

/**
 * Follow listing links from the current page, including aggregator cards,
 * sitemap <loc> entries, and official org pages. Assets and nav/filter hosts are dropped.
 */
export function listingUrls(html: string, pageUrl: string, limit: number = MAX_LISTING_URLS): string[] {
  const base = normalizePageUrl(pageUrl);
  if (base === undefined) {
    return [];
  }

  const found: string[] = [];
  const seen = new Set<string>([base]);

  for (const href of collectRawRefs(html)) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) {
      continue;
    }

    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      continue;
    }
    resolved.hash = "";
    if (!isFollowable(resolved, base)) {
      continue;
    }
    const next = resolved.toString();
    if (seen.has(next) || !isSafePublicHttpUrl(next)) {
      continue;
    }
    seen.add(next);
    found.push(next);
    if (found.length >= limit) {
      break;
    }
  }

  return found.sort((a, b) => listingFollowScore(b) - listingFollowScore(a));
}

/** @deprecated Use listingUrls. Kept so older imports keep compiling. */
export function officialListingUrls(
  html: string,
  pageUrl: string,
  _officialDomains?: string[],
  limit: number = MAX_LISTING_URLS,
): string[] {
  return listingUrls(html, pageUrl, limit);
}
