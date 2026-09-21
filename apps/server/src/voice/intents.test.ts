import { describe, expect, it } from "vitest";
import { parseVoiceIntent } from "./intents.js";

describe("parseVoiceIntent", () => {
  it("maps documented English and Amharic utterances to product intents", () => {
    const cases: Array<{
      text: string;
      intent: string;
      type?: string;
      decision?: string;
    }> = [
      { text: "Should I apply for this?", intent: "ANALYZE_OPPORTUNITY" },
      { text: "ለዚህ እድል ማመልከት", intent: "ANALYZE_OPPORTUNITY" },
      { text: "Why did you say apply?", intent: "EXPLAIN_DECISION" },
      { text: "Why did you say that?", intent: "EXPLAIN_DECISION" },
      { text: "ለምን", intent: "EXPLAIN_DECISION" },
      { text: "What am I missing?", intent: "SHOW_MISSING_REQUIREMENTS" },
      { text: "ምን ጎድሎኛል?", intent: "SHOW_MISSING_REQUIREMENTS" },
      { text: "What should I prepare?", intent: "SHOW_READINESS" },
      { text: "ምን ላዘጋጅ?", intent: "SHOW_READINESS" },
      {
        text: "Show me opportunities I should apply for.",
        intent: "FILTER_BY_DECISION",
        decision: "APPLY",
      },
      { text: "Show me maybe opportunities.", intent: "FILTER_BY_DECISION", decision: "MAYBE" },
      { text: "Show me skip opportunities.", intent: "FILTER_BY_DECISION", decision: "SKIP" },
      { text: "Show me internships", intent: "FILTER_OPPORTUNITIES", type: "internship" },
      { text: "Show me opportunities", intent: "SHOW_OPPORTUNITIES" },
      { text: "እድሎች", intent: "SHOW_OPPORTUNITIES" },
      { text: "Open this opportunity", intent: "OPEN_OPPORTUNITY" },
      { text: "Tell me about this opportunity", intent: "OPEN_OPPORTUNITY" },
      { text: "Update profile", intent: "UPDATE_PROFILE" },
      {
        text: "What is missing from my profile?",
        intent: "UPDATE_PROFILE",
        replyHint: "profile_gaps",
      },
      {
        text: "Clarify uncertain requirements",
        intent: "SHOW_MISSING_REQUIREMENTS",
        replyHint: "clarify_uncertain",
      },
      {
        text: "Personalize my readiness plan",
        intent: "SHOW_READINESS",
        replyHint: "personalized_plan",
      },
      { text: "Repeat that", intent: "UNSUPPORTED", replyHint: "repeat" },
      { text: "What's the weather in Addis?", intent: "UNSUPPORTED" },
    ];

    for (const example of cases) {
      const parsed = parseVoiceIntent(example.text);
      expect({ text: example.text, ...parsed }).toMatchObject(example);
    }
  });

  it("does not treat analyze-this as a catalog APPLY filter", () => {
    expect(parseVoiceIntent("Should I apply for this?").intent).toBe("ANALYZE_OPPORTUNITY");
    expect(parseVoiceIntent("Show me opportunities I should apply for.").intent).toBe(
      "FILTER_BY_DECISION",
    );
  });
});
