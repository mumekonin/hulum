import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalysisContract, Profile } from "@hulum/shared";
import { demoProfileInput } from "../data/demo-profile.js";
import { explainDecision, sanitizeExplanation } from "./explain.js";

const profile: Profile = {
  id: "p1",
  userId: "u1",
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
  ...demoProfileInput,
};

const contract: AnalysisContract = {
  decision: "APPLY",
  fitScore: 90,
  summary: "You meet the key known requirements.",
  nextAction: "Confirm the official deadline and apply.",
  explanation: "You meet the key known requirements.",
  disclaimer: "HULUM is a decision aid, not an official eligibility authority.",
  requirements: [
    {
      key: "country",
      status: "MET",
      evidence: "Ethiopia",
      reason: "African eligibility is met.",
      critical: true,
      requirementText: "Open to African students",
    },
  ],
  gaps: [],
  readiness: [],
};

const originalFetch = globalThis.fetch;
const originalEnv = {
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_MODEL: process.env.CLAUDE_MODEL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.CLAUDE_API_KEY = originalEnv.CLAUDE_API_KEY;
  process.env.CLAUDE_MODEL = originalEnv.CLAUDE_MODEL;
  process.env.ANTHROPIC_API_KEY = originalEnv.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_MODEL = originalEnv.ANTHROPIC_MODEL;
  vi.unstubAllGlobals();
});

describe("sanitizeExplanation", () => {
  it("keeps wording that restates the engine decision", () => {
    expect(sanitizeExplanation("APPLY because country and field match.", "APPLY", "fallback")).toBe(
      "APPLY because country and field match.",
    );
  });

  it("replaces wording that names a different APPLY/MAYBE/SKIP", () => {
    expect(sanitizeExplanation("You should SKIP this opportunity.", "APPLY", "engine summary")).toBe("engine summary");
  });
});

describe("explainDecision", () => {
  it("returns the engine summary when Claude is not configured", async () => {
    delete process.env.CLAUDE_API_KEY;
    delete process.env.CLAUDE_MODEL;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
    await expect(explainDecision(profile, contract)).resolves.toBe(contract.summary);
  });

  it("keeps Claude text that does not change APPLY/MAYBE/SKIP", async () => {
    process.env.CLAUDE_API_KEY = "test-key";
    process.env.CLAUDE_MODEL = "test-model";
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          content: [
            {
              text: JSON.stringify({
                decision: "APPLY",
                explanation: "Abeba meets the stored country and field facts.",
              }),
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as typeof fetch;

    await expect(explainDecision(profile, contract)).resolves.toBe("Abeba meets the stored country and field facts.");
  });

  it("falls back to the engine summary if Claude JSON names a different decision", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.ANTHROPIC_MODEL = "test-model";
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          content: [{ text: JSON.stringify({ decision: "SKIP", explanation: "This is not a good fit." }) }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as typeof fetch;

    await expect(explainDecision(profile, contract)).resolves.toBe(contract.summary);
  });

  it("falls back to the engine summary if Claude times out", async () => {
    process.env.CLAUDE_API_KEY = "test-key";
    process.env.CLAUDE_MODEL = "test-model";
    globalThis.fetch = vi.fn(async () => {
      throw new Error("timeout");
    }) as typeof fetch;

    await expect(explainDecision(profile, contract)).resolves.toBe(contract.summary);
  });
});
