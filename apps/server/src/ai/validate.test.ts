import { describe, expect, it } from "vitest";
import type { AnalysisContract } from "@hulum/shared";
import { validateClaudeOutput } from "./validate.js";

const contract: AnalysisContract = {
  decision: "MAYBE",
  fitScore: 70,
  summary: "Some requirements are still uncertain.",
  nextAction: "Confirm the official field and need criteria.",
  explanation: "Some requirements are still uncertain.",
  disclaimer: "HULUM is a decision aid, not an official eligibility authority.",
  requirements: [
    {
      key: "field",
      status: "UNCERTAIN",
      evidence: "Official field wording is stored as uncertain.",
      reason: "Confirm on the official source.",
      critical: true,
      requirementText: "Field accepted by the programme",
    },
  ],
  gaps: [{ requirement: "Field accepted by the programme", status: "UNCERTAIN", remediation: "Confirm on the official source." }],
  readiness: [],
};

describe("validateClaudeOutput", () => {
  it("accepts JSON that matches the engine decision", () => {
    const raw = JSON.stringify({
      decision: "MAYBE",
      explanation: "Field fit is still uncertain, so HULUM stays MAYBE.",
    });
    expect(validateClaudeOutput(raw, contract)).toBe("Field fit is still uncertain, so HULUM stays MAYBE.");
  });

  it("replaces malformed output with the engine summary", () => {
    expect(validateClaudeOutput("not json", contract)).toBe(contract.summary);
    expect(validateClaudeOutput(JSON.stringify({ explanation: "missing decision" }), contract)).toBe(contract.summary);
  });

  it("replaces JSON that contradicts APPLY/MAYBE/SKIP", () => {
    const raw = JSON.stringify({ decision: "APPLY", explanation: "You should apply now." });
    expect(validateClaudeOutput(raw, contract)).toBe(contract.summary);
  });

  it("replaces wording that claims official eligibility or erases uncertainty", () => {
    expect(
      validateClaudeOutput(
        JSON.stringify({ decision: "MAYBE", explanation: "You are officially eligible for this award." }),
        contract,
      ),
    ).toBe(contract.summary);
    expect(
      validateClaudeOutput(
        JSON.stringify({ decision: "MAYBE", explanation: "You definitely qualify with no uncertainty." }),
        contract,
      ),
    ).toBe(contract.summary);
  });
});
