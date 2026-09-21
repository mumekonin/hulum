import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { clearOpsEvents, opsSummary, recordOpsEvent } from "./metrics.js";
import { resetStoreForTests } from "../store/fileStore.js";

describe("ops metrics", () => {
  beforeEach(() => {
    clearOpsEvents();
  });

  it("summarizes latency and error codes without storing payloads", () => {
    recordOpsEvent({ kind: "api", name: "GET profile", ok: true, ms: 12 });
    recordOpsEvent({ kind: "api", name: "POST analyses", ok: false, ms: 40, code: "HTTP_422" });
    recordOpsEvent({ kind: "ai", name: "explain.groq", ok: true, ms: 80 });
    recordOpsEvent({
      kind: "ai_validation",
      name: "explain.unsafe_fallback",
      ok: false,
      ms: 0,
      code: "AI_UNSAFE_OUTPUT",
    });

    const summary = opsSummary();
    expect(summary.windowSize).toBe(4);
    expect(summary.byKind.api?.errors).toBe(1);
    expect(summary.byKind.api?.codes.HTTP_422).toBe(1);
    expect(summary.byKind.ai?.avgMs).toBe(80);
    expect(summary.byKind.ai_validation?.codes.AI_UNSAFE_OUTPUT).toBe(1);
    expect(JSON.stringify(summary)).not.toMatch(/password|gsk_|bearer/i);
  });
});

describe("GET /api/ops/summary and POST /api/ops/decision-audit", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    clearOpsEvents();
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-ops-"));
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
      throw new Error("Expected a TCP address");
    }
    baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
    resetStoreForTests();
    clearOpsEvents();
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns aggregate ops summary after a profile request", async () => {
    await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });

    const response = await fetch(`${baseUrl}/api/ops/summary`);
    const body = (await response.json()) as {
      data: { windowSize: number; byKind: { api?: { count: number } } };
    };

    expect(response.status).toBe(200);
    expect(body.data.windowSize).toBeGreaterThan(0);
    expect(body.data.byKind.api?.count).toBeGreaterThan(0);
  });

  it("returns decision audit without inventing eligibility", async () => {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const demoBody = (await demo.json()) as { data: { userId: string } };

    const response = await fetch(`${baseUrl}/api/ops/decision-audit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: demoBody.data.userId,
        opportunityId: "opp-a2sv",
      }),
    });
    const body = (await response.json()) as {
      data: {
        decision: string;
        audit: { rulePath: string; fitScoreIsAdvisoryOnly: boolean };
      };
    };

    expect(response.status).toBe(200);
    expect(body.data.decision).toMatch(/APPLY|MAYBE|SKIP/);
    expect(body.data.audit.fitScoreIsAdvisoryOnly).toBe(true);
    expect(body.data.audit.rulePath).toMatch(
      /critical_not_met|keys_met_no_uncertainty|default_maybe|expired_override/,
    );
  });
});
