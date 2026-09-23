import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import {
  Decision,
  Language,
  ReadinessStatus,
  RequirementKey,
  RequirementStatus,
  type Analysis,
  type AnalysisExplanation,
} from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { HttpError } from "../http/errors.js";
import { createAnalysisRouter, createAnalyzeRouter } from "./index.js";
import type { AnalysisService } from "./service.js";

const analysis: Analysis = {
  id: "44444444-4444-4444-8444-444444444444",
  userId: "11111111-1111-4111-8111-111111111111",
  opportunityId: "33333333-3333-4333-8333-333333333333",
  decision: Decision.APPLY,
  fitScore: 100,
  summary: "You meet the key known requirements.",
  requirements: [
    {
      id: "55555555-5555-4555-8555-555555555555",
      analysisId: "44444444-4444-4444-8444-444444444444",
      key: RequirementKey.COUNTRY,
      text: "Eligible countries: ET, KE",
      status: RequirementStatus.MET,
      evidence: "ET",
      reason: "Country matches.",
    },
  ],
  nextAction: "Prepare your application materials and verify the official source.",
  readiness: [],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const explanation: AnalysisExplanation = {
  analysisId: analysis.id,
  decision: analysis.decision,
  fitScore: analysis.fitScore,
  nextAction: analysis.nextAction,
  explanation: "You meet the known requirements. The model cannot change APPLY.",
  language: Language.ENGLISH,
};

function fakeService(overrides: Partial<AnalysisService> = {}): AnalysisService {
  return {
    analyze: async () => analysis,
    getById: async () => analysis,
    getReadiness: async () => [],
    explain: async () => explanation,
    personalizedReadinessPlan: async () => ({
      analysisId: analysis.id,
      decision: analysis.decision,
      fitScore: analysis.fitScore,
      nextAction: analysis.nextAction,
      plan: analysis.nextAction,
      language: Language.ENGLISH,
      items: [],
    }),
    ...overrides,
  };
}

function createTestApp(service: AnalysisService): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api/opportunities", createAnalyzeRouter(service));
  app.use("/api/analyses", createAnalysisRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("analysis routes", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  async function listen(app: express.Express): Promise<number> {
    const server = createServer(app);
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
    return (address as AddressInfo).port;
  }

  it("analyzes an opportunity and returns a complete analysis", async () => {
    const port = await listen(createTestApp(fakeService()));
    const response = await fetch(
      `http://127.0.0.1:${port}/api/opportunities/${analysis.opportunityId}/analyze`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: analysis.userId }),
      },
    );
    const body: unknown = await response.json();
    expect(response.status).toBe(201);
    expect(body).toEqual({ data: analysis, error: null });
    const payload = body as { data: Analysis };
    expect(payload.data.decision).toBe(Decision.APPLY);
    expect(payload.data.fitScore).toBe(100);
    expect(payload.data.requirements.length).toBeGreaterThan(0);
    expect(payload.data.nextAction.length).toBeGreaterThan(0);
  });

  it("rejects analyze when userId is missing", async () => {
    const port = await listen(createTestApp(fakeService()));
    const response = await fetch(
      `http://127.0.0.1:${port}/api/opportunities/${analysis.opportunityId}/analyze`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when the profile or opportunity is missing", async () => {
    const port = await listen(
      createTestApp(
        fakeService({
          analyze: async () => {
            throw new HttpError(404, "NOT_FOUND", "Profile not found.");
          },
        }),
      ),
    );
    const response = await fetch(
      `http://127.0.0.1:${port}/api/opportunities/${analysis.opportunityId}/analyze`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: analysis.userId }),
      },
    );
    const body: unknown = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({
      data: null,
      error: { code: "NOT_FOUND", message: "Profile not found." },
    });
  });

  it("reads a stored analysis", async () => {
    const port = await listen(createTestApp(fakeService()));
    const response = await fetch(`http://127.0.0.1:${port}/api/analyses/${analysis.id}`);
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ data: analysis, error: null });
  });

  it("returns stored readiness items", async () => {
    const items = [
      {
        id: "66666666-6666-4666-8666-666666666666",
        analysisId: analysis.id,
        title: "No extra documents listed",
        description: "The opportunity does not list document requirements.",
        status: ReadinessStatus.NOT_REQUIRED,
        priority: 1,
        createdAt: "2026-09-19T00:00:00.000Z",
        updatedAt: "2026-09-19T00:00:00.000Z",
      },
    ];
    const port = await listen(createTestApp(fakeService({ getReadiness: async () => items })));
    const response = await fetch(`http://127.0.0.1:${port}/api/analyses/${analysis.id}/readiness`);
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ data: items, error: null });
  });

  it("explains a stored analysis without changing the decision", async () => {
    const port = await listen(
      createTestApp(
        fakeService({
          explain: async () => ({
            ...explanation,
            explanation: "This should be SKIP instead of APPLY.",
            decision: analysis.decision,
          }),
        }),
      ),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/analyses/${analysis.id}/explain`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: Language.ENGLISH }),
    });
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    const payload = body as { data: AnalysisExplanation };
    expect(payload.data.decision).toBe(Decision.APPLY);
    expect(payload.data.analysisId).toBe(analysis.id);
  });

  it("returns a personalized readiness plan without changing the decision", async () => {
    const port = await listen(
      createTestApp(
        fakeService({
          personalizedReadinessPlan: async () => ({
            analysisId: analysis.id,
            decision: analysis.decision,
            fitScore: analysis.fitScore,
            nextAction: analysis.nextAction,
            plan: "Keep APPLY. Prepare your application materials and verify the official source.",
            language: Language.ENGLISH,
            items: [],
          }),
        }),
      ),
    );
    const response = await fetch(
      `http://127.0.0.1:${port}/api/analyses/${analysis.id}/readiness/plan`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: Language.ENGLISH }),
      },
    );
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    const payload = body as { data: { decision: string; plan: string } };
    expect(payload.data.decision).toBe(Decision.APPLY);
    expect(payload.data.plan.length).toBeGreaterThan(0);
  });

  it("returns 404 when the analysis does not exist", async () => {
    const port = await listen(
      createTestApp(fakeService({ getById: async () => undefined, getReadiness: async () => undefined })),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/analyses/${analysis.id}`);
    expect(response.status).toBe(404);
  });
});
