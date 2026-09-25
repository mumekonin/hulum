import { isSafePublicHttpUrl } from "./safety.js";

const LISTING_HINT = /intern|intership|opportunit|scholarship|fellowship|research-call|event|vacanc|\bjobs?\b|grant|apply|deadline/i;
const SKIP_EXT = /\.(css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|map|mp4|webm)(\?|#|$)/i;
const MAX_LISTING_URLS = 40;

function normalizePageUrl(raw: string): string | undefined {
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/**
 * Follow listing links from the current page, including aggregator cards
 * and official org pages. Assets and unsafe hosts are dropped.
 */
export function listingUrls(html: string, pageUrl: string, limit: number = MAX_LISTING_URLS): string[] {
  const base = normalizePageUrl(pageUrl);
  if (base === undefined) {
    return [];
  }

  const found: string[] = [];
  const seen = new Set<string>([base]);
  const hrefs = html.matchAll(/href\s*=\s*["']([^"']+)["']/gi);

  for (const match of hrefs) {
    const href = match[1];
    if (href === undefined || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) {
      continue;
    }
    if (SKIP_EXT.test(href) || !LISTING_HINT.test(href)) {
      continue;
    }

    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      continue;
    }
    resolved.hash = "";
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

  return found;
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
