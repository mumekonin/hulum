import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { loadStore, resetStoreForTests } from "../store/fileStore.js";

describe("POST /api/voice/action ANALYZE_OPPORTUNITY", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-voice-"));
    process.env.STORE_PATH = path.join(tmpDir, "store.json");
    resetStoreForTests();

    const server = createServer(createApp({ store: "file" }));
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    closeServer = () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Expected a TCP address for the test server");
    }
    baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
    resetStoreForTests();
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("runs the decision engine instead of telling the user to click Analyze", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };
    expect(demo.ok).toBe(true);

    const response = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-a2sv",
      }),
    });
    const body = (await response.json()) as {
      data: { intent: string; reply: string; analysis?: { decision: string; fitScore: number } };
    };

    expect(response.status).toBe(200);
    expect(body.data.intent).toBe("ANALYZE_OPPORTUNITY");
    expect(body.data.analysis?.decision).toMatch(/APPLY|MAYBE|SKIP/);
    expect(body.data.reply).toMatch(/APPLY|MAYBE|SKIP/);
    expect(body.data.reply).not.toMatch(/Use Analyze on the opportunity page/);
  });

  it("explains the stored decision after analyze without changing APPLY/MAYBE/SKIP", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    const analyzed = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-a2sv",
      }),
    });
    const analyzedBody = (await analyzed.json()) as {
      data: { analysis?: { id: string; decision: string; explanation: string } };
    };
    const decision = analyzedBody.data.analysis?.decision;
    expect(decision).toBeDefined();

    const explained = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Why did you say that?",
        opportunityId: "opp-a2sv",
      }),
    });
    const explainedBody = (await explained.json()) as {
      data: { intent: string; reply: string; analysis?: { decision: string } };
    };

    expect(explained.status).toBe(200);
    expect(explainedBody.data.intent).toBe("EXPLAIN_DECISION");
    expect(explainedBody.data.analysis?.decision).toBe(decision);
    expect(explainedBody.data.reply.startsWith(`${decision}.`)).toBe(true);
  });

  it("returns the stored readiness checklist after analyze", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-a2sv",
      }),
    });

    const readiness = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "What should I prepare?",
        opportunityId: "opp-a2sv",
      }),
    });
    const readinessBody = (await readiness.json()) as {
      data: {
        intent: string;
        reply: string;
        analysis?: { decision: string; nextAction: string; readiness: Array<{ title: string }> };
      };
    };

    expect(readiness.status).toBe(200);
    expect(readinessBody.data.intent).toBe("SHOW_READINESS");
    expect(readinessBody.data.analysis?.readiness?.length).toBeGreaterThan(0);
    expect(readinessBody.data.reply).toContain("Prepare:");
    expect(readinessBody.data.reply).toContain(readinessBody.data.analysis?.nextAction ?? "__missing__");
  });

  it("returns stored NOT_MET and UNCERTAIN requirements after analyze", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-chevening",
      }),
    });

    const gaps = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "What am I missing?",
        opportunityId: "opp-chevening",
      }),
    });
    const gapsBody = (await gaps.json()) as {
      data: {
        intent: string;
        reply: string;
        analysis?: { gaps: Array<{ requirement: string; status: string }> };
      };
    };

    expect(gaps.status).toBe(200);
    expect(gapsBody.data.intent).toBe("SHOW_MISSING_REQUIREMENTS");
    expect(gapsBody.data.analysis?.gaps?.length).toBeGreaterThan(0);
    expect(gapsBody.data.analysis?.gaps?.some((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN")).toBe(
      true,
    );
    expect(gapsBody.data.reply).toContain("Missing or uncertain:");
    const firstGap = gapsBody.data.analysis?.gaps?.[0];
    expect(firstGap).toBeDefined();
    expect(gapsBody.data.reply).toContain(firstGap?.requirement ?? "__missing__");
    expect(gapsBody.data.reply).toMatch(/NOT_MET|UNCERTAIN/);
  });

  it("reports profile completeness gaps without changing stored profile facts", async () => {
    const created = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_profile_gaps",
        name: "Gap Checker",
        educationLevel: "bachelor_in_progress",
        fieldOfStudy: "Computer Science",
        graduationYear: 2027,
        country: "Ethiopia",
        languages: ["English"],
        preferredLanguage: "en",
      }),
    });
    expect(created.ok).toBe(true);

    const response = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_profile_gaps",
        text: "What is missing from my profile?",
      }),
    });
    const body = (await response.json()) as { data: { intent: string; reply: string } };

    expect(response.status).toBe(200);
    expect(body.data.intent).toBe("UPDATE_PROFILE");
    expect(body.data.reply).toContain("Your profile is missing:");
    expect(body.data.reply).toMatch(/city|skills|experience|interests/);
    expect(body.data.reply).toContain("Voice cannot silently change stored facts");
  });

  it("proposes profile extract without saving when Groq is unset", async () => {
    const response = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_profile_extract",
        text: "Extract profile from this: I study computer science in Addis Ababa, Ethiopia",
      }),
    });
    const body = (await response.json()) as { data: { intent: string; reply: string } };

    expect(response.status).toBe(200);
    expect(body.data.intent).toBe("UPDATE_PROFILE");
    expect(body.data.reply).toMatch(/could not extract|not saved|confirm|Propose|Profile/i);
  });

  it("clarifies UNCERTAIN requirements without treating them as met", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-chevening",
      }),
    });

    const clarified = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Clarify uncertain requirements",
        opportunityId: "opp-chevening",
      }),
    });
    const clarifiedBody = (await clarified.json()) as {
      data: { intent: string; reply: string };
    };

    expect(clarified.status).toBe(200);
    expect(clarifiedBody.data.intent).toBe("SHOW_MISSING_REQUIREMENTS");
    expect(clarifiedBody.data.reply).toMatch(
      /UNCERTAIN|No UNCERTAIN requirements|official source/,
    );
    expect(clarifiedBody.data.reply.toLowerCase()).not.toContain("you meet");
  });

  it("filters the catalog by APPLY without treating the request as analyze-this", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    const response = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Show me opportunities I should apply for.",
      }),
    });
    const body = (await response.json()) as {
      data: { intent: string; reply: string; opportunities?: Array<{ id: string }> };
    };

    expect(response.status).toBe(200);
    expect(body.data.intent).toBe("FILTER_BY_DECISION");
    expect(body.data.reply).toContain("APPLY opportunities:");
    expect(body.data.opportunities?.some((item) => item.id === "opp-a2sv")).toBe(true);
    expect(body.data.opportunities?.some((item) => item.id === "opp-chevening")).toBe(false);
  });

  it("filters MAYBE and SKIP from the engine without persisting those analyses", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    const maybe = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Show me maybe opportunities.",
      }),
    });
    const maybeBody = (await maybe.json()) as {
      data: { intent: string; reply: string; opportunities?: Array<{ id: string }> };
    };

    expect(maybe.status).toBe(200);
    expect(maybeBody.data.intent).toBe("FILTER_BY_DECISION");
    expect(maybeBody.data.reply).toMatch(/^MAYBE |^No MAYBE /);
    expect(maybeBody.data.opportunities?.some((item) => item.id === "opp-chevening")).toBe(false);

    const skip = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Show me skip opportunities.",
      }),
    });
    const skipBody = (await skip.json()) as {
      data: { intent: string; reply: string; opportunities?: Array<{ id: string }> };
    };

    expect(skip.status).toBe(200);
    expect(skipBody.data.intent).toBe("FILTER_BY_DECISION");
    expect(skipBody.data.reply).toContain("SKIP opportunities:");
    expect(skipBody.data.opportunities?.some((item) => item.id === "opp-chevening")).toBe(true);
    expect(skipBody.data.opportunities?.some((item) => item.id === "opp-a2sv")).toBe(false);
  });

  it("persists a voice session without storing utterance text", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    const response = await fetch(`${baseUrl}/api/voice/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        language: "am",
        text: "secret transcript that must not be stored",
      }),
    });
    const body = (await response.json()) as {
      data: { id: string; userId: string; language: string; startedAt: string; endedAt: string | null; provider: string };
    };

    expect(response.status).toBe(201);
    expect(body.data.userId).toBe(demoBody.data.userId);
    expect(body.data.language).toBe("am");
    expect(body.data.endedAt).toBeNull();
    expect(body.data.provider).toBe("text-fallback");
    expect(body.data.id).toMatch(/^voice_/);

    resetStoreForTests();
    const store = await loadStore();
    const saved = store.voiceSessions.find((item) => item.id === body.data.id);
    expect(saved).toBeDefined();
    expect(saved?.language).toBe("am");
    expect(JSON.stringify(saved)).not.toContain("secret transcript");
  });

  it("runs the English core loop: session, analyze, why, gaps, readiness", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };
    const userId = demoBody.data.userId;

    const session = await fetch(`${baseUrl}/api/voice/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, language: "en" }),
    });
    const sessionBody = (await session.json()) as { data: { language: string; provider: string } };
    expect(session.status).toBe(201);
    expect(sessionBody.data.language).toBe("en");
    expect(sessionBody.data.provider).toBe("text-fallback");

    async function speak(text: string, extra?: Record<string, string>) {
      const response = await fetch(`${baseUrl}/api/voice/action`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, text, language: "en", ...extra }),
      });
      const body = (await response.json()) as {
        data: { intent: string; reply: string; analysis?: { decision: string } };
      };
      expect(response.status).toBe(200);
      return body.data;
    }

    const listed = await speak("Show me internships");
    expect(listed.intent).toBe("FILTER_OPPORTUNITIES");

    const analyzed = await speak("Should I apply for this?", { opportunityId: "opp-a2sv" });
    expect(analyzed.intent).toBe("ANALYZE_OPPORTUNITY");
    expect(analyzed.analysis?.decision).toMatch(/APPLY|MAYBE|SKIP/);
    const decision = analyzed.analysis?.decision;

    const explained = await speak("Why did you say that?", { opportunityId: "opp-a2sv" });
    expect(explained.intent).toBe("EXPLAIN_DECISION");
    expect(explained.reply.startsWith(`${decision}.`)).toBe(true);

    const gaps = await speak("What am I missing?", { opportunityId: "opp-a2sv" });
    expect(gaps.intent).toBe("SHOW_MISSING_REQUIREMENTS");

    const readiness = await speak("What should I prepare?", { opportunityId: "opp-a2sv" });
    expect(readiness.intent).toBe("SHOW_READINESS");
  });

  it("describes the current opportunity from stored facts, not the first catalog item", async () => {
    const fresh = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_context_fresh",
        name: "Abeba Tesfaye",
        educationLevel: "bachelor_in_progress",
        fieldOfStudy: "Computer Science",
        graduationYear: 2027,
        country: "Ethiopia",
        languages: ["English"],
        preferredLanguage: "en",
      }),
    });
    expect(fresh.ok).toBe(true);

    const missing = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_context_fresh",
        text: "Tell me about this opportunity",
      }),
    });
    const missingBody = (await missing.json()) as { data: { intent: string; reply: string } };
    expect(missing.status).toBe(200);
    expect(missingBody.data.intent).toBe("OPEN_OPPORTUNITY");
    expect(missingBody.data.reply).toContain("Choose an opportunity first");

    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Should I apply for this?",
        opportunityId: "opp-a2sv",
      }),
    });

    const about = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        text: "Tell me about this opportunity",
      }),
    });
    const aboutBody = (await about.json()) as {
      data: { intent: string; reply: string; opportunity?: { id: string; sourceUrl: string } };
    };

    expect(about.status).toBe(200);
    expect(aboutBody.data.intent).toBe("OPEN_OPPORTUNITY");
    expect(aboutBody.data.opportunity?.id).toBe("opp-a2sv");
    expect(aboutBody.data.reply).toContain("A2SV");
    expect(aboutBody.data.reply).toContain(aboutBody.data.opportunity?.sourceUrl ?? "__missing__");
    expect(aboutBody.data.reply).toMatch(/Stored HULUM decision: (APPLY|MAYBE|SKIP)/);
    expect(aboutBody.data.reply).not.toContain("Chevening");
  });
});
