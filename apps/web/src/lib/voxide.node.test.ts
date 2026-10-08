import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canSpeakLocale,
  finishedUserUtterance,
  isEmptyVoxideWsError,
  isHulumProductRequest,
} from "./voxide";

describe("finishedUserUtterance", () => {
  it("waits while the sentence is still streaming in", () => {
    assert.equal(finishedUserUtterance([{ role: "user", text: " Show", partial: true }]), "");
  });

  it("treats a sentence as finished once the assistant starts answering", () => {
    assert.equal(
      finishedUserUtterance([
        { role: "user", text: " Show me scholarships.", partial: true },
        { role: "ai", text: "I'd love to help", partial: true },
      ]),
      "Show me scholarships.",
    );
  });

  it("returns a final or typed sentence", () => {
    assert.equal(finishedUserUtterance([{ role: "user", text: "Analyze for me" }]), "Analyze for me");
    assert.equal(finishedUserUtterance([{ role: "ai", text: "Hello" }]), "");
  });

  it("does not hand a half-heard word to the product actions", () => {
    const halfHeard = finishedUserUtterance([{ role: "user", text: " Show", partial: true }]);
    assert.equal(isHulumProductRequest(halfHeard), false);
  });
});

describe("isEmptyVoxideWsError", () => {
  it("treats the SDK's empty Event as noise, not a recognition failure", () => {
    assert.equal(isEmptyVoxideWsError({}), true);
    assert.equal(isEmptyVoxideWsError(undefined), true);
    assert.equal(isEmptyVoxideWsError({ type: "error" }), true);
    assert.equal(isEmptyVoxideWsError({ message: "   " }), true);
  });

  it("keeps real Voxide error strings", () => {
    assert.equal(isEmptyVoxideWsError("usage_limit"), false);
    assert.equal(isEmptyVoxideWsError({ message: "usage_limit" }), false);
  });
});

describe("canSpeakLocale", () => {
  it("always speaks English", () => {
    assert.equal(canSpeakLocale("en-US", []), true);
  });

  it("speaks Amharic only when the browser has an Amharic voice", () => {
    assert.equal(canSpeakLocale("am-ET", [{ lang: "en-US" }]), false);
    assert.equal(canSpeakLocale("am-ET", [{ lang: "am-ET" }]), true);
  });
});
