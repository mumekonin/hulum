import { assertSafeHttpUrl, hostnameOf, isLeadHost, isSafePublicHttpUrl } from "./safety.js";

export const KNOWN_LEAD_HOSTS = ["scholarship.et", "scholars4dev.com", "opportunitydesk.org"];

function normalizeVisit(raw: string): string | undefined {
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/** URL is the page we fetched, or the host/URL actually appears in that page. */
export function urlGroundedOnPage(url: string, pageText: string, fetchedPageUrl: string): boolean {
  if (!isSafePublicHttpUrl(url)) {
    return false;
  }
  const fetched = normalizeVisit(fetchedPageUrl);
  const candidate = normalizeVisit(url);
  if (fetched !== undefined && candidate === fetched) {
    return true;
  }
  const host = hostnameOf(url);
  if (host === undefined) {
    return false;
  }
  const fetchedHost = hostnameOf(fetchedPageUrl);
  if (fetchedHost !== undefined && host === fetchedHost) {
    return true;
  }
  const text = pageText.toLowerCase();
  return text.includes(url.toLowerCase()) || text.includes(host);
}

/**
 * Prefer a non-aggregator official URL when it is public and grounded.
 * Otherwise keep the listing page we fetched (aggregators may be sourceUrl).
 */
export function resolveSourceUrl(
  officialSourceUrl: string,
  fetchedPageUrl: string,
  leadHosts: string[],
): string {
  const host = hostnameOf(officialSourceUrl);
  if (
    host !== undefined &&
    !isLeadHost(host, leadHosts) &&
    isSafePublicHttpUrl(officialSourceUrl)
  ) {
    try {
      return assertSafeHttpUrl(officialSourceUrl).toString();
    } catch {
      return fetchedPageUrl;
    }
  }
  return fetchedPageUrl;
}
