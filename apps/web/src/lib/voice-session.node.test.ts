import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { pageOpportunityId, readVoiceSession, voiceContextFor, writeVoiceSession } from "./voice-session";

function memoryStorage(): Storage {
  const rows = new Map<string, string>();
  return {
    get length() {
      return rows.size;
    },
    clear: () => rows.clear(),
    getItem: (key) => rows.get(key) ?? null,
    key: (index) => [...rows.keys()][index] ?? null,
    removeItem: (key) => void rows.delete(key),
    setItem: (key, value) => void rows.set(key, value),
  };
}

describe("pageOpportunityId", () => {
  it("reads the listing id from a detail path only", () => {
    assert.equal(pageOpportunityId("/opportunities/abc-123"), "abc-123");
    assert.equal(pageOpportunityId("/opportunities/abc-123/"), "abc-123");
    assert.equal(pageOpportunityId("/opportunities"), undefined);
    assert.equal(pageOpportunityId("/analysis/abc-123"), undefined);
  });
});

describe("voiceContextFor", () => {
  it("uses the listing on screen instead of the last listed one, without its analysis", () => {
    assert.deepEqual(
      voiceContextFor("/opportunities/on-screen", { opportunityId: "first-in-list", analysisId: "a1" }),
      { opportunityId: "on-screen" },
    );
  });

  it("keeps the stored analysis when it belongs to the listing on screen", () => {
    const session = { opportunityId: "on-screen", analysisId: "a1" };
    assert.deepEqual(voiceContextFor("/opportunities/on-screen", session), session);
  });

  it("keeps the session off detail pages", () => {
    const session = { opportunityId: "x", analysisId: "a1" };
    assert.deepEqual(voiceContextFor("/assistant", session), session);
  });
});

describe("writeVoiceSession", () => {
  beforeEach(() => {
    Object.assign(globalThis, { window: { sessionStorage: memoryStorage() } });
  });

  it("drops an analysis that belonged to a different listing", () => {
    writeVoiceSession({ opportunityId: "y", analysisId: "analysis-of-y" });
    writeVoiceSession({ opportunityId: "x" });
    assert.deepEqual(readVoiceSession(), { opportunityId: "x" });
  });

  it("keeps the analysis when the listing is unchanged", () => {
    writeVoiceSession({ opportunityId: "x", analysisId: "analysis-of-x" });
    writeVoiceSession({ opportunityId: "x" });
    assert.deepEqual(readVoiceSession(), { opportunityId: "x", analysisId: "analysis-of-x" });
  });
});
