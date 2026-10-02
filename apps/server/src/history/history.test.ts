import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { AnalysisSummary, SavedOpportunity } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { HttpError } from "../http/errors.js";
import { authSigningSecret, issueSessionToken } from "../security/session.js";
import { createAnalysisListRouter, createSavedRouter } from "./index.js";
import type { HistoryStore } from "./store.js";

const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const opportunityOne = "33333333-3333-4333-8333-333333333333";
const opportunityTwo = "44444444-4444-4444-8444-444444444444";
const unknownOpportunity = "55555555-5555-4555-8555-555555555555";

function summary(userId: string, opportunityId: string): AnalysisSummary & { userId: string } {
  return {
    userId,
    analysisId: `${opportunityId.slice(0, 8)}-aaaa-4aaa-8aaa-${userId.slice(0, 12)}`,
    opportunityId,
    title: "Test fellowship",
    organization: "Test org",
    type: "fellowship",
    deadline: "2026-12-01",
    decision: "MAYBE",
    fitScore: 60,
    analyzedAt: "2026-09-27T00:00:00.000Z",
    readiness: { done: 1, total: 3 },
  };
}

function createMemoryStore(): HistoryStore {
  const analyses = [summary(userA, opportunityOne), summary(userA, opportunityTwo), summary(userB, opportunityOne)];
  const saved = new Map<string, SavedOpportunity>();
  const key = (userId: string, opportunityId: string) => `${userId}:${opportunityId}`;
  return {
    async listLatestAnalyses(userId, opportunityId) {
      return analyses
        .filter((row) => row.userId === userId && (opportunityId === undefined || row.opportunityId === opportunityId))
        .map(({ userId: _owner, ...rest }) => rest);
    },
    async listSaved(userId) {
      return [...saved.entries()].filter(([k]) => k.startsWith(`${userId}:`)).map(([, v]) => v);
    },
    async save(userId, opportunityId) {
      if (opportunityId === unknownOpportunity) {
        throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
      }
      const row = saved.get(key(userId, opportunityId)) ?? { opportunityId, savedAt: "2026-09-27T00:00:00.000Z" };
      saved.set(key(userId, opportunityId), row);
      return row;
    },
    async unsave(userId, opportunityId) {
      return saved.delete(key(userId, opportunityId));
    },
  };
}

function sessionFor(userId: string): Record<string, string> {
  return { "X-Hulum-Session": issueSessionToken(userId, authSigningSecret()) };
}

describe("history routes", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  async function listen(): Promise<string> {
    const store = createMemoryStore();
    const app = express();
    app.use(express.json());
    app.use("/api/analyses", createAnalysisListRouter(store));
    app.use("/api/saved", createSavedRouter(store));
    app.use(notFoundHandler);
    app.use(errorHandler);
    const server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    closeServer = () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    const address = server.address() as AddressInfo;
    return `http://127.0.0.1:${address.port}`;
  }

  it("requires a session even in open local mode", async () => {
    const base = await listen();
    expect((await fetch(`${base}/api/analyses`)).status).toBe(401);
    expect((await fetch(`${base}/api/saved`)).status).toBe(401);
  });

  it("rejects a forged session", async () => {
    const base = await listen();
    const response = await fetch(`${base}/api/analyses`, {
      headers: { "X-Hulum-Session": issueSessionToken(userB, "not-the-server-secret") },
    });
    expect(response.status).toBe(401);
  });

  it("lists only the session user's analyses", async () => {
    const base = await listen();
    const response = await fetch(`${base}/api/analyses`, { headers: sessionFor(userA) });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { data: AnalysisSummary[] };
    expect(body.data.map((row) => row.opportunityId).sort()).toEqual([opportunityOne, opportunityTwo]);

    const other = (await (await fetch(`${base}/api/analyses`, { headers: sessionFor(userB) })).json()) as {
      data: AnalysisSummary[];
    };
    expect(other.data).toHaveLength(1);
  });

  it("filters by opportunity and validates the id", async () => {
    const base = await listen();
    const filtered = (await (
      await fetch(`${base}/api/analyses?opportunityId=${opportunityTwo}`, { headers: sessionFor(userA) })
    ).json()) as { data: AnalysisSummary[] };
    expect(filtered.data.map((row) => row.opportunityId)).toEqual([opportunityTwo]);

    const bad = await fetch(`${base}/api/analyses?opportunityId=nope`, { headers: sessionFor(userA) });
    expect(bad.status).toBe(400);
  });

  it("saves, lists, and removes a saved opportunity per user", async () => {
    const base = await listen();
    const headers = { ...sessionFor(userA), "Content-Type": "application/json" };
    const created = await fetch(`${base}/api/saved`, {
      method: "POST",
      headers,
      body: JSON.stringify({ opportunityId: opportunityOne }),
    });
    expect(created.status).toBe(201);
    const again = await fetch(`${base}/api/saved`, {
      method: "POST",
      headers,
      body: JSON.stringify({ opportunityId: opportunityOne }),
    });
    expect(again.status).toBe(201);

    const mine = (await (await fetch(`${base}/api/saved`, { headers })).json()) as { data: SavedOpportunity[] };
    expect(mine.data.map((row) => row.opportunityId)).toEqual([opportunityOne]);
    const theirs = (await (await fetch(`${base}/api/saved`, { headers: sessionFor(userB) })).json()) as {
      data: SavedOpportunity[];
    };
    expect(theirs.data).toEqual([]);

    expect((await fetch(`${base}/api/saved/${opportunityOne}`, { method: "DELETE", headers: sessionFor(userB) })).status).toBe(404);
    expect((await fetch(`${base}/api/saved/${opportunityOne}`, { method: "DELETE", headers })).status).toBe(200);
    expect((await fetch(`${base}/api/saved/${opportunityOne}`, { method: "DELETE", headers })).status).toBe(404);
  });

  it("rejects an invalid or unknown opportunity on save", async () => {
    const base = await listen();
    const headers = { ...sessionFor(userA), "Content-Type": "application/json" };
    const invalid = await fetch(`${base}/api/saved`, { method: "POST", headers, body: JSON.stringify({}) });
    expect(invalid.status).toBe(400);
    const unknown = await fetch(`${base}/api/saved`, {
      method: "POST",
      headers,
      body: JSON.stringify({ opportunityId: unknownOpportunity }),
    });
    expect(unknown.status).toBe(404);
  });
});
