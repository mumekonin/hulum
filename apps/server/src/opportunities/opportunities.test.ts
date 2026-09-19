import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { OpportunityType, VerificationStatus, type Opportunity } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { createOpportunityRouter } from "./index.js";
import type { OpportunityService } from "./service.js";

const fixture: Opportunity = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "API fixture",
  organization: "HULUM Test",
  type: OpportunityType.FELLOWSHIP,
  description: "Used only in unit tests. Not a catalog seed.",
  deadline: "2026-12-31",
  countryEligibility: ["ET"],
  educationRequirements: ["university_student"],
  fieldRequirements: ["computer_science"],
  experienceRequirements: [],
  languageRequirements: ["en"],
  documentRequirements: ["cv"],
  otherRequirements: [],
  applicationUrl: "https://example.invalid/apply",
  sourceUrl: "https://example.invalid/source",
  verificationStatus: VerificationStatus.NEEDS_REVIEW,
  lastVerifiedAt: null,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

function createTestApp(service: OpportunityService): express.Express {
  const app = express();
  app.use("/api/opportunities", createOpportunityRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("opportunity routes", () => {
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

  it("lists structured opportunities", async () => {
    const port = await listen(
      createTestApp({
        list: async () => [fixture],
        getById: async () => fixture,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/opportunities`);
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [fixture], error: null });
  });

  it("returns 400 for a non-UUID id", async () => {
    const port = await listen(
      createTestApp({
        list: async () => [],
        getById: async () => undefined,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/opportunities/not-an-id`);
    const body: unknown = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({
      data: null,
      error: { code: "INVALID_ID", message: "Opportunity id must be a UUID." },
    });
  });

  it("returns 404 when the opportunity does not exist", async () => {
    const port = await listen(
      createTestApp({
        list: async () => [],
        getById: async () => undefined,
      }),
    );
    const response = await fetch(
      `http://127.0.0.1:${port}/api/opportunities/11111111-1111-4111-8111-111111111111`,
    );
    const body: unknown = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({
      data: null,
      error: { code: "NOT_FOUND", message: "Opportunity not found." },
    });
  });
});
