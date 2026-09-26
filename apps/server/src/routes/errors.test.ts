import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { resetStoreForTests } from "../store/fileStore.js";

describe("API error envelope", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-errors-"));
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

  it("returns the error envelope for unknown routes, records, and invalid requests", async () => {
    const missingRoute = await fetch(`${baseUrl}/api/does-not-exist`);
    const missingRouteBody = (await missingRoute.json()) as { data: null; error: { message: string; code: string } };
    expect(missingRoute.status).toBe(404);
    expect(missingRouteBody.data).toBeNull();
    expect(missingRouteBody.error.code).toBe("NOT_FOUND");

    const missingOpportunity = await fetch(`${baseUrl}/api/opportunities/opp-missing`);
    const missingOpportunityBody = (await missingOpportunity.json()) as { error: { code: string } };
    expect(missingOpportunity.status).toBe(404);
    expect(missingOpportunityBody.error.code).toBe("OPPORTUNITY_NOT_FOUND");

    const missingAnalysis = await fetch(`${baseUrl}/api/analyses/analysis_missing`);
    const missingAnalysisBody = (await missingAnalysis.json()) as { error: { code: string } };
    expect(missingAnalysis.status).toBe(404);
    expect(missingAnalysisBody.error.code).toBe("ANALYSIS_NOT_FOUND");

    const invalidAnalyze = await fetch(`${baseUrl}/api/opportunities/opp-a2sv/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const invalidAnalyzeBody = (await invalidAnalyze.json()) as { data: null; error: { code: string } };
    expect(invalidAnalyze.status).toBe(422);
    expect(invalidAnalyzeBody.data).toBeNull();
    expect(invalidAnalyzeBody.error.code).toBe("INVALID_REQUEST");

    const invalidVoice = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user_x" }),
    });
    const invalidVoiceBody = (await invalidVoice.json()) as { error: { code: string } };
    expect(invalidVoice.status).toBe(422);
    expect(invalidVoiceBody.error.code).toBe("INVALID_VOICE");

    const invalidJson = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    const invalidJsonBody = (await invalidJson.json()) as { data: null; error: { message: string; code: string } };
    expect(invalidJson.status).toBe(400);
    expect(invalidJsonBody.data).toBeNull();
    expect(invalidJsonBody.error.code).toBe("INVALID_JSON");
    expect(invalidJsonBody.error.message).not.toMatch(/SyntaxError|Unexpected token/i);
  });

  it("refuses analyze without a profile and keeps unsupported voice as a product reply", async () => {
    const analyzed = await fetch(`${baseUrl}/api/opportunities/opp-a2sv/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user_nobody" }),
    });
    const analyzedBody = (await analyzed.json()) as { data: null; error: { code: string; message: string } };
    expect(analyzed.status).toBe(404);
    expect(analyzedBody.data).toBeNull();
    expect(analyzedBody.error.code).toBe("PROFILE_NOT_FOUND");
    expect(analyzedBody.error.message).toContain("profile");

    const unsupported = await fetch(`${baseUrl}/api/voice/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user_nobody", text: "sing me a song" }),
    });
    const unsupportedBody = (await unsupported.json()) as {
      data: { intent: string; reply: string };
      error: null;
    };
    expect(unsupported.status).toBe(200);
    expect(unsupportedBody.error).toBeNull();
    expect(unsupportedBody.data.intent).toBe("UNSUPPORTED");
    expect(unsupportedBody.data.reply).toMatch(/I can show fellowships, scholarships, internships/i);
    expect(unsupportedBody.data.reply).not.toMatch(/stack|internal error/i);
  });
});
