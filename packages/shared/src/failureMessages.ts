/** Client-facing failure copy for Phase 20 — no invented mic/deploy claims. */

export const NETWORK_MESSAGE = "We couldn't reach HULUM. Check your connection and try again.";

export const MIC_UNAVAILABLE_TITLE = "Voice unavailable";

export const MIC_UNAVAILABLE_BODY =
  "Microphone or Voxide is not available right now. Type a request or use a quick action — those call the same HULUM APIs.";

export const TEXT_FALLBACK_HINT =
  "Voice had trouble. Type a request or use a quick action — those call the same HULUM APIs.";

export function isNetworkFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /failed to fetch|networkerror|econnrefused|load failed/i.test(error.message);
}

export function recognitionFailureMessage(detail?: string): string {
  const trimmed = detail?.trim() ?? "";
  if (trimmed.length > 0) {
    return `Voice error: ${trimmed}. ${TEXT_FALLBACK_HINT}`;
  }
  return `Recognition or connection failed. ${TEXT_FALLBACK_HINT}`;
}
