import { Decision, Language } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { HttpError } from "../http/errors.js";
import { EXPLAIN_SYSTEM_PROMPT, explanationFrom } from "./explain.js";
import { fallbackExplanation } from "./guard.js";
import { GROQ_CHAT_COMPLETIONS_URL, createGroqChatClient } from "./groq.js";

const analysis = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: "11111111-1111-4111-8111-111111111111",
  opportunityId: "33333333-3333-4333-8333-333333333333",
  decision: Decision.APPLY,
  fitScore: 91,
  summary: "You meet the key known requirements.",
  requirements: [],
  nextAction: "Prepare your application materials and verify the official source.",
  readiness: [],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("Groq explainer", () => {
  it("keeps the stored decision even if the model text says SKIP", () => {
    const result = explanationFrom(analysis, Language.ENGLISH, "You should SKIP this.");
    expect(result.decision).toBe(Decision.APPLY);
    expect(result.nextAction).toBe(analysis.nextAction);
    expect(result.explanation).toBe(fallbackExplanation(analysis));
    expect(EXPLAIN_SYSTEM_PROMPT.includes("Never change APPLY")).toBe(true);
  });

  it("reads content from the Groq chat completions payload", async () => {
    const client = createGroqChatClient({
      apiKey: "test-key",
      model: "openai/gpt-oss-20b",
      url: GROQ_CHAT_COMPLETIONS_URL,
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "  You meet the listed requirements.  " } }],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    });
    await expect(client.complete([{ role: "user", content: "explain" }])).resolves.toBe(
      "You meet the listed requirements.",
    );
  });

  it("maps Groq failures to AI_UNAVAILABLE", async () => {
    const client = createGroqChatClient({
      apiKey: "test-key",
      model: "openai/gpt-oss-20b",
      fetchImpl: async () => new Response("nope", { status: 429 }),
    });
    await expect(client.complete([{ role: "user", content: "explain" }])).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});
