import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { resetStoreForTests } from "../store/fileStore.js";

describe("POST /api/voice/action ANALYZE_OPPORTUNITY", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-voice-"));
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
});
