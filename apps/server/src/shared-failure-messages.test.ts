import { describe, expect, it } from "vitest";
import {
  MIC_UNAVAILABLE_BODY,
  MIC_UNAVAILABLE_TITLE,
  NETWORK_MESSAGE,
  TEXT_FALLBACK_HINT,
  isNetworkFetchError,
  recognitionFailureMessage,
} from "@hulum/shared";

describe("shared failure messages (Phase 20)", () => {
  it("maps fetch/network errors without inventing a host", () => {
    expect(isNetworkFetchError(new Error("Failed to fetch"))).toBe(true);
    expect(isNetworkFetchError(new Error("NetworkError when attempting to fetch"))).toBe(true);
    expect(isNetworkFetchError(new Error("ECONNREFUSED"))).toBe(true);
    expect(isNetworkFetchError(new Error("validation failed"))).toBe(false);
    expect(NETWORK_MESSAGE).toMatch(/couldn't reach HULUM/i);
  });

  it("keeps microphone-unavailable copy pointing at text fallback", () => {
    expect(MIC_UNAVAILABLE_TITLE).toBe("Voice unavailable");
    expect(MIC_UNAVAILABLE_BODY).toMatch(/Type a request|quick action/i);
    expect(MIC_UNAVAILABLE_BODY).not.toMatch(/deployed|production|ethiodeploy/i);
  });

  it("keeps recognition failure copy pointing at text fallback", () => {
    expect(recognitionFailureMessage()).toMatch(/Recognition or connection failed/);
    expect(recognitionFailureMessage("permission denied")).toMatch(/permission denied/);
    expect(recognitionFailureMessage("permission denied")).toContain(TEXT_FALLBACK_HINT);
  });
});
