import { Decision, VoiceIntent, fail, isVoiceIntent, ok } from "@hulum/shared";
import { describe, expect, it } from "vitest";

describe("@hulum/shared contract", () => {
  it("locks APPLY MAYBE SKIP", () => {
    expect(Decision).toEqual({
      APPLY: "APPLY",
      MAYBE: "MAYBE",
      SKIP: "SKIP",
    });
  });

  it("locks the Task 22 voice intents and rejects SHOW_GAPS", () => {
    expect(Object.values(VoiceIntent)).toEqual([
      "SHOW_OPPORTUNITIES",
      "FILTER_OPPORTUNITIES",
      "FILTER_BY_DECISION",
      "OPEN_OPPORTUNITY",
      "ANALYZE_OPPORTUNITY",
      "EXPLAIN_DECISION",
      "SHOW_MISSING_REQUIREMENTS",
      "SHOW_READINESS",
      "UPDATE_PROFILE",
    ]);
    expect(isVoiceIntent("SHOW_MISSING_REQUIREMENTS")).toBe(true);
    expect(isVoiceIntent("SHOW_GAPS")).toBe(false);
  });

  it("uses the shared API envelope", () => {
    expect(ok({ status: "ok" })).toEqual({ data: { status: "ok" }, error: null });
    expect(fail("NOT_FOUND", "The requested resource was not found.")).toEqual({
      data: null,
      error: { code: "NOT_FOUND", message: "The requested resource was not found." },
    });
  });
});
