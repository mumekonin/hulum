import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
    assert.equal(isNetworkFetchError(new Error("Failed to fetch")), true);
    assert.equal(isNetworkFetchError(new Error("NetworkError when attempting to fetch")), true);
    assert.equal(isNetworkFetchError(new Error("ECONNREFUSED")), true);
    assert.equal(isNetworkFetchError(new Error("validation failed")), false);
    assert.match(NETWORK_MESSAGE, /couldn't reach HULUM/i);
  });

  it("keeps microphone-unavailable copy pointing at text fallback", () => {
    assert.equal(MIC_UNAVAILABLE_TITLE, "Voice unavailable");
    assert.match(MIC_UNAVAILABLE_BODY, /Type a request|quick action/i);
    assert.doesNotMatch(MIC_UNAVAILABLE_BODY, /deployed|production|ethiodeploy/i);
  });

  it("keeps recognition failure copy pointing at text fallback", () => {
    assert.match(recognitionFailureMessage(), /Recognition or connection failed/);
    assert.match(recognitionFailureMessage("permission denied"), /permission denied/);
    assert.ok(recognitionFailureMessage("permission denied").includes(TEXT_FALLBACK_HINT));
  });
});
