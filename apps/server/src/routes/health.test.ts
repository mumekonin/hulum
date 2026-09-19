import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("GET /api/health", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  it("returns the success envelope without secrets", async () => {
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
    const { port } = address as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: { status: "ok" }, error: null });
  });
});
