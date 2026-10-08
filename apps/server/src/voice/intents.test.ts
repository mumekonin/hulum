import { describe, expect, it } from "vitest";
import { formatProfileGaps, parseVoiceIntent, stripProfileExtractDescription, wantsListWithAnalyze } from "./intents.js";

describe("parseVoiceIntent", () => {
  it("maps documented English and Amharic utterances to product intents", () => {
    const cases: Array<{
      text: string;
      intent: string;
      type?: string;
      decision?: string;
      replyHint?: string;
    }> = [
      { text: "Should I apply for this?", intent: "ANALYZE_OPPORTUNITY" },
      { text: "ለዚህ እድል ማመልከት", intent: "ANALYZE_OPPORTUNITY" },
      { text: "Why did you say apply?", intent: "EXPLAIN_DECISION" },
      { text: "Why did you say that?", intent: "EXPLAIN_DECISION" },
      { text: "What do you think about this?", intent: "EXPLAIN_DECISION" },
      { text: "What is the deadline?", intent: "OPEN_OPPORTUNITY" },
      { text: "Which documents do I need?", intent: "OPEN_OPPORTUNITY" },
      { text: "ለምን", intent: "EXPLAIN_DECISION" },
      { text: "What am I missing?", intent: "SHOW_MISSING_REQUIREMENTS" },
      { text: "ምን ጎድሎኛል?", intent: "SHOW_MISSING_REQUIREMENTS" },
      { text: "What should I prepare?", intent: "SHOW_READINESS" },
      { text: "ምን ላዘጋጅ?", intent: "SHOW_READINESS" },
      { text: "Show me opportunities I should apply for.", intent: "FILTER_BY_DECISION", decision: "APPLY" },
      { text: "Show me maybe opportunities.", intent: "FILTER_BY_DECISION", decision: "MAYBE" },
      { text: "Show me skip opportunities.", intent: "FILTER_BY_DECISION", decision: "SKIP" },
      { text: "Show me internships", intent: "FILTER_OPPORTUNITIES", type: "internship" },
      { text: "Show me opportunities", intent: "SHOW_OPPORTUNITIES" },
      { text: "እድሎች", intent: "SHOW_OPPORTUNITIES" },
      { text: "Open this opportunity", intent: "OPEN_OPPORTUNITY" },
      { text: "Tell me about this opportunity", intent: "OPEN_OPPORTUNITY" },
      { text: "Update profile", intent: "UPDATE_PROFILE" },
      {
        text: "Extract profile from this: I study CS in Addis Ababa",
        intent: "UPDATE_PROFILE",
        replyHint: "profile_extract",
      },
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
      { text: "What's the weather in Addis?", intent: "UNSUPPORTED" },
      { text: "show me scholarship and analysis", intent: "ANALYZE_OPPORTUNITY", type: "scholarship" },
      { text: "analysis for me", intent: "ANALYZE_OPPORTUNITY" },
      { text: "anlysis", intent: "ANALYZE_OPPORTUNITY" },
      { text: "scholarshipwwan natti agarsiisi", intent: "FILTER_OPPORTUNITIES", type: "scholarship" },
      { text: "carraa kana madaali", intent: "ANALYZE_OPPORTUNITY" },
      { text: "carraa kana ibsi", intent: "OPEN_OPPORTUNITY" },
    ];

    for (const example of cases) {
      const parsed = parseVoiceIntent(example.text);
      expect({ text: example.text, ...parsed }).toMatchObject(example);
    }
  });

  it("maps mixed English + Amharic keywords without inventing a second e2e language", () => {
    // Text path only (ADR 004). Does not claim live Amharic STT.
    expect(parseVoiceIntent("Why ለምን did you say that?", "en").intent).toBe("EXPLAIN_DECISION");
    expect(parseVoiceIntent("What am I missing ምን ጎድሎኛል?", "en").intent).toBe("SHOW_MISSING_REQUIREMENTS");
    expect(parseVoiceIntent("Should I apply ለዚህ እድል ማመልከት?", "en").intent).toBe("ANALYZE_OPPORTUNITY");
    expect(parseVoiceIntent("What's the weather in Addis?", "en").intent).toBe("UNSUPPORTED");
  });

  it("does not treat analyze-this as a catalog APPLY filter", () => {
    expect(parseVoiceIntent("Should I apply for this?").intent).toBe("ANALYZE_OPPORTUNITY");
    expect(parseVoiceIntent("Show me opportunities I should apply for.").intent).toBe("FILTER_BY_DECISION");
  });

  it("treats show-plus-analysis as one analyze request", () => {
    expect(wantsListWithAnalyze("show me scholarship and analysis based on my profile")).toBe(true);
    expect(wantsListWithAnalyze("Should I apply for this?")).toBe(false);
  });

  it("does not treat spoken HULUM results or Gemini refusals as analyze", () => {
    expect(parseVoiceIntent("I can't analyze anything right now, but I'm here to help").intent).toBe(
      "UNSUPPORTED",
    );
    expect(
      parseVoiceIntent(
        "SKIP for Gotoh Tokyu Group Scholarship 2027 in Turkey (Fully Funded). Fit 65%.",
      ).intent,
    ).toBe("UNSUPPORTED");
    expect(
      parseVoiceIntent(
        "Scholarships: Gotoh Tokyu Group Scholarship 2027 in Turkey (Fully Funded) — Tokyo City University",
      ).intent,
    ).toBe("UNSUPPORTED");
  });
});

describe("formatProfileGaps", () => {
  it("lists missing fields without inventing profile facts", () => {
    expect(formatProfileGaps([])).toMatch(/complete/i);
    expect(formatProfileGaps(["city", "skills"])).toContain("city");
    expect(formatProfileGaps(["city", "skills"])).toContain("skills");
    expect(formatProfileGaps(["city"])).toContain("Voice cannot silently change stored facts");
  });
});

describe("stripProfileExtractDescription", () => {
  it("removes the extract-request prefix", () => {
    expect(
      stripProfileExtractDescription("Extract profile from this: I study CS in Addis Ababa"),
    ).toBe("I study CS in Addis Ababa");
  });
});
