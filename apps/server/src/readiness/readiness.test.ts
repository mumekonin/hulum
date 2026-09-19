import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { ReadinessStatus, type ReadinessItem } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { HttpError } from "../http/errors.js";
import { createReadinessRouter } from "./index.js";
import type { ReadinessService } from "./service.js";

const item: ReadinessItem = {
  id: "66666666-6666-4666-8666-666666666666",
  analysisId: "44444444-4444-4444-8444-444444444444",
  title: "Prepare cv",
  description: "Document requirement needs confirmation.",
  status: ReadinessStatus.DONE,
  priority: 1,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

function createTestApp(service: ReadinessService): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api/readiness", createReadinessRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("readiness routes", () => {
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

  it("updates readiness status", async () => {
    const port = await listen(
      createTestApp({
        updateStatus: async () => item,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/readiness/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: ReadinessStatus.DONE }),
    });
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ data: item, error: null });
  });

  it("rejects an invalid status", async () => {
    const port = await listen(
      createTestApp({
        updateStatus: async () => item,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/readiness/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "SKIPPED" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when the item does not exist", async () => {
    const port = await listen(
      createTestApp({
        updateStatus: async () => {
          throw new HttpError(404, "NOT_FOUND", "Readiness item not found.");
        },
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/readiness/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: ReadinessStatus.TODO }),
    });
    expect(response.status).toBe(404);
  });
});
