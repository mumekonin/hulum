import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { loadStore, resetStoreForTests } from "../store/fileStore.js";

describe("API integration", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-flow-"));
    process.env.STORE_PATH = path.join(tmpDir, "store.json");
    resetStoreForTests();

    const server = createServer(createApp());
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

  it("creates a profile, loads a sourced opportunity, and stores APPLY/MAYBE/SKIP", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string; name: string } };
    expect(demo.status).toBe(201);
    expect(demoBody.data.userId).toBeTruthy();

    const loaded = await fetch(`${baseUrl}/api/profile/${demoBody.data.userId}`);
    const loadedBody = (await loaded.json()) as { data: { name: string } };
    expect(loaded.status).toBe(200);
    expect(loadedBody.data.name).toBe(demoBody.data.name);

    const list = await fetch(`${baseUrl}/api/opportunities`);
    const listBody = (await list.json()) as { data: Array<{ id: string }> };
    expect(list.status).toBe(200);
    expect(listBody.data.some((item) => item.id === "opp-a2sv")).toBe(true);

    const opportunity = await fetch(`${baseUrl}/api/opportunities/opp-a2sv`);
    const opportunityBody = (await opportunity.json()) as {
      data: { id: string; sourceUrl: string; applicationUrl: string };
    };
    expect(opportunity.status).toBe(200);
    expect(opportunityBody.data.sourceUrl).toMatch(/^https:\/\//);
    expect(opportunityBody.data.applicationUrl).toMatch(/^https:\/\//);

    const analyzed = await fetch(`${baseUrl}/api/opportunities/opp-a2sv/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: demoBody.data.userId }),
    });
    const analyzedBody = (await analyzed.json()) as {
      data: {
        id: string;
        decision: string;
        fitScore: number;
        requirements: unknown[];
        disclaimer: string;
      };
    };
    expect(analyzed.status).toBe(201);
    expect(analyzedBody.data.decision).toMatch(/^(APPLY|MAYBE|SKIP)$/);
    expect(analyzedBody.data.requirements.length).toBeGreaterThan(0);
    expect(analyzedBody.data.disclaimer).toContain("official organization");

    const stored = await fetch(`${baseUrl}/api/analyses/${analyzedBody.data.id}`);
    const storedBody = (await stored.json()) as { data: { id: string; decision: string } };
    expect(stored.status).toBe(200);
    expect(storedBody.data.decision).toBe(analyzedBody.data.decision);
  });

  it("stores a readiness checklist after analysis and persists status updates", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };
    expect(demo.status).toBe(201);

    const analyzed = await fetch(`${baseUrl}/api/opportunities/opp-a2sv/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: demoBody.data.userId }),
    });
    const analyzedBody = (await analyzed.json()) as {
      data: { id: string; readiness: Array<{ id: string; status: string; title: string }> };
    };
    expect(analyzed.status).toBe(201);
    expect(analyzedBody.data.readiness.length).toBeGreaterThan(0);
    expect(
      analyzedBody.data.readiness.every((item) =>
        ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"].includes(item.status),
      ),
    ).toBe(true);

    const listed = await fetch(`${baseUrl}/api/analyses/${analyzedBody.data.id}/readiness`);
    const listedBody = (await listed.json()) as { data: Array<{ id: string; status: string }> };
    expect(listed.status).toBe(200);
    expect(listedBody.data.length).toBe(analyzedBody.data.readiness.length);

    const target = listedBody.data[0];
    const patched = await fetch(`${baseUrl}/api/readiness/${target.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    const patchedBody = (await patched.json()) as { data: { id: string; status: string } };
    expect(patched.status).toBe(200);
    expect(patchedBody.data.status).toBe("DONE");

    const stored = await fetch(`${baseUrl}/api/analyses/${analyzedBody.data.id}/readiness`);
    const storedBody = (await stored.json()) as { data: Array<{ id: string; status: string }> };
    expect(stored.status).toBe(200);
    expect(storedBody.data.find((item) => item.id === target.id)?.status).toBe("DONE");
  });

  it("runs the full text-fallback voice loop without persisting extra analyses", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };
    const userId = demoBody.data.userId;
    expect(demo.status).toBe(201);

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
        data: {
          intent: string;
          reply: string;
          analysis?: { decision: string };
          opportunities?: Array<{ id: string; type?: string }>;
        };
      };
      expect(response.status).toBe(200);
      return body.data;
    }

    const internships = await speak("Show me internships");
    expect(internships.intent).toBe("FILTER_OPPORTUNITIES");
    expect(internships.opportunities?.length).toBeGreaterThan(0);
    expect(internships.opportunities?.every((item) => item.type === "internship")).toBe(true);

    const about = await speak("Tell me about this opportunity", { opportunityId: "opp-a2sv" });
    expect(about.intent).toBe("OPEN_OPPORTUNITY");
    expect(about.reply).toMatch(/https:\/\//);
    expect(about.reply).toContain("Official source:");

    const analyzed = await speak("Should I apply for this?", { opportunityId: "opp-a2sv" });
    expect(analyzed.intent).toBe("ANALYZE_OPPORTUNITY");
    expect(analyzed.analysis?.decision).toMatch(/^(APPLY|MAYBE|SKIP)$/);
    const decision = analyzed.analysis?.decision;

    const explained = await speak("Why did you say that?", { opportunityId: "opp-a2sv" });
    expect(explained.intent).toBe("EXPLAIN_DECISION");
    expect(explained.reply.startsWith(`${decision}.`)).toBe(true);

    const gaps = await speak("What am I missing?", { opportunityId: "opp-a2sv" });
    expect(gaps.intent).toBe("SHOW_GAPS");

    const readiness = await speak("What should I prepare?", { opportunityId: "opp-a2sv" });
    expect(readiness.intent).toBe("SHOW_READINESS");

    const applyList = await speak("Show me opportunities I should apply for");
    expect(applyList.intent).toBe("FILTER_BY_DECISION");
    expect(applyList.reply).toContain("APPLY");

    resetStoreForTests();
    const store = await loadStore();
    expect(store.analyses).toHaveLength(1);
    expect(store.analyses[0]?.opportunityId).toBe("opp-a2sv");
  });
});
