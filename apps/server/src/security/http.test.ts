import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import type { AppEnv } from "../config/env.js";
import { createRateLimiter } from "./rate-limit.js";

const env: AppEnv = {
  NODE_ENV: "test",
  PORT: 3001,
  CLIENT_URL: "http://localhost:3000",
  DATABASE_URL: undefined,
  SUPABASE_URL: undefined,
  SUPABASE_ANON_KEY: undefined,
  SUPABASE_SERVICE_ROLE_KEY: undefined,
  CLAUDE_API_KEY: undefined,
  CLAUDE_MODEL: undefined,
  GROQ_API_KEY: undefined,
  GROQ_MODEL: undefined,
  VOXIDE_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_URL: undefined,
  INVESTIGATE_ADMIN_SECRET: undefined,
};

describe("API security middleware", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  async function listen(app = createApp({ env, store: "postgres" })): Promise<number> {
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
    return address.port;
  }

  it("allows the configured web origin and rejects a foreign origin header", async () => {
    const port = await listen();
    const allowed = await fetch(`http://127.0.0.1:${port}/api/health`, {
      headers: { origin: "http://localhost:3000" },
    });
    const denied = await fetch(`http://127.0.0.1:${port}/api/health`, {
      headers: { origin: "https://evil.example.invalid" },
    });

    expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    expect(allowed.headers.get("x-content-type-options")).toBe("nosniff");
    expect(allowed.headers.get("x-powered-by")).toBeNull();
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("answers CORS preflight for the web origin", async () => {
    const port = await listen();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
  });

  it("rejects invalid JSON with INVALID_INPUT", async () => {
    const port = await listen();
    const response = await fetch(`http://127.0.0.1:${port}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    const body: unknown = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({
      data: null,
      error: { code: "INVALID_INPUT", message: "Request body must be valid JSON." },
    });
  });

  it("rate-limits POST /api/analyses/:id/explain", async () => {
    const port = await listen(
      createApp({
        env,
        store: "postgres",
        explainLimiter: createRateLimiter({ windowMs: 60_000, max: 1 }),
      }),
    );
    const url = `http://127.0.0.1:${port}/api/analyses/11111111-1111-4111-8111-111111111111/explain`;
    const first = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const second = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const body: unknown = await second.json();

    expect(first.status).not.toBe(429);
    expect(second.status).toBe(429);
    expect(body).toEqual({
      data: null,
      error: {
        code: "RATE_LIMITED",
        message: "Too many explanation requests. Please try again shortly.",
      },
    });
  });
});
