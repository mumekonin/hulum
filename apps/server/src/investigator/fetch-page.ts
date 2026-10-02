import { assertSafeHttpUrl, isAllowedFetchUrl, isSafePublicHttpUrl } from "./safety.js";

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 12_000;

function canFetch(raw: string, fetchHosts: string[]): boolean {
  if (isAllowedFetchUrl(raw, fetchHosts)) {
    return true;
  }
  // Discovered listing pages (aggregators and new official hosts) are fetched
  // when the URL is public http(s). Private/localhost stays blocked.
  return fetchHosts.length === 0 || isSafePublicHttpUrl(raw);
}

export async function fetchPageText(
  raw: string,
  fetchHosts: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  if (!canFetch(raw, fetchHosts)) {
    throw new Error("Fetch URL is not a safe public http(s) page.");
  }
  const url = assertSafeHttpUrl(raw);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(url.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "HULUM-investigator/0.1 (https://github.com/mumekonin/hulum)" },
    });
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${String(response.status)}.`);
    }
    const finalUrl = response.url || url.toString();
    if (!isSafePublicHttpUrl(finalUrl)) {
      throw new Error("Redirect was not a safe public http(s) page.");
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error("Response is larger than the fetch limit.");
    }
    return buffer.toString("utf8");
  } finally {
    clearTimeout(timer);
  }
}
