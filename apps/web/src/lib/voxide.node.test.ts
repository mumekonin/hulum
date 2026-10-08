import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canSpeakLocale,
  finishedUserUtterance,
  hulumTranscript,
  isAnswerableUtterance,
  isEchoOfReply,
  isEmptyVoxideWsError,
  isHulumProductRequest,
  isStopCommand,
} from "./voxide";

describe("finishedUserUtterance", () => {
  it("waits while the sentence is still streaming in", () => {
    assert.equal(finishedUserUtterance([{ role: "user", text: " Show", partial: true }]), "");
  });

  it("does not close a still-streaming sentence just because the agent started talking", () => {
    assert.equal(
      finishedUserUtterance([
        { role: "user", text: " Show me scholarships.", partial: true },
        { role: "ai", text: "I'd love to help", partial: true },
      ]),
      "",
    );
  });

  it("reads a finished sentence even when the agent already replied", () => {
    assert.equal(
      finishedUserUtterance([
        { role: "user", text: "Show me scholarships." },
        { role: "ai", text: "I'd love to help" },
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

describe("hulumTranscript", () => {
  it("replaces the live agent's extra talk with the HULUM answer", () => {
    const shown = hulumTranscript(
      [
        { role: "user", text: "What scholarships fit me?" },
        { role: "ai", text: "I'd love to help. Let me tell you about the weather too." },
      ],
      "Scholarships: Chevening — UK Government",
    );
    assert.deepEqual(shown, [
      { role: "user", text: "What scholarships fit me?" },
      { role: "ai", text: "Scholarships: Chevening — UK Government" },
    ]);
  });

  it("keeps an earlier HULUM answer when a new question starts", () => {
    const shown = hulumTranscript([
      { role: "user", text: "Show me scholarships" },
      { role: "ai", text: "Scholarships: Chevening — UK Government" },
      { role: "user", text: "Analyze for me" },
      { role: "ai", text: "Sure, happy to chat about that and anything else." },
    ]);
    assert.deepEqual(shown, [
      { role: "user", text: "Show me scholarships" },
      { role: "ai", text: "Scholarships: Chevening — UK Government" },
      { role: "user", text: "Analyze for me" },
    ]);
  });
});

describe("isAnswerableUtterance", () => {
  it("answers a scholarship question", () => {
    assert.equal(isAnswerableUtterance("Which scholarships fit a computer science student?"), true);
    assert.equal(isAnswerableUtterance("Show me scholarships"), true);
  });

  it("does not answer noise, stop, or HULUM's own words", () => {
    assert.equal(isAnswerableUtterance("I'm sorry, I don't have the ability"), false);
    assert.equal(isAnswerableUtterance("Scholarships: Chevening — UK Government"), false);
    assert.equal(isAnswerableUtterance("Here are current opportunities."), false);
    assert.equal(isAnswerableUtterance("to apply audio specialist and"), false);
    assert.equal(isAnswerableUtterance("Login to apply audio specialist and audio"), false);
    assert.equal(isStopCommand("stop"), true);
    assert.equal(isAnswerableUtterance("stop"), false);
    assert.equal(isHulumProductRequest("Show"), true);
  });
});

describe("isEchoOfReply", () => {
  it("recognizes a fragment of the answer the microphone just heard", () => {
    assert.equal(
      isEchoOfReply(
        "to apply audio specialist and",
        "Login to apply as an audio specialist and submit the audio sample.",
      ),
      true,
    );
    assert.equal(
      isEchoOfReply("Here are current opportunities.", "Here are current opportunities: Chevening — UK Government"),
      true,
    );
    assert.equal(isEchoOfReply("Show me scholarships", "No APPLY opportunities for your profile."), false);
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
