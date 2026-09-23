import { assertSafeHttpUrl, isAllowedFetchUrl } from "./safety.js";

const MAX_BYTES = 400_000;
const TIMEOUT_MS = 15000;

export async function fetchPageText(
  raw: string,
  fetchHosts: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  if (!isAllowedFetchUrl(raw, fetchHosts)) {
    throw new Error("Fetch host is not on the source or official list.");
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
    if (!isAllowedFetchUrl(finalUrl, fetchHosts)) {
      throw new Error("Redirect left the allowed host list.");
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
