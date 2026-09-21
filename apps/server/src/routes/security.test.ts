import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { resetStoreForTests } from "../store/fileStore.js";

const SECRET = "sk-hulum-test-secret-do-not-leak";

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

describe("API security", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";
  const previous = {
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    VOXIDE_API_KEY: process.env.VOXIDE_API_KEY,
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-security-"));
    process.env.STORE_PATH = path.join(tmpDir, "store.json");
    process.env.CLAUDE_API_KEY = SECRET;
    process.env.ANTHROPIC_API_KEY = SECRET;
    process.env.VOXIDE_API_KEY = SECRET;
    process.env.CLIENT_URL = "http://localhost:3000";
    process.env.NODE_ENV = "test";
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
    restoreEnv("CLAUDE_API_KEY", previous.CLAUDE_API_KEY);
    restoreEnv("ANTHROPIC_API_KEY", previous.ANTHROPIC_API_KEY);
    restoreEnv("VOXIDE_API_KEY", previous.VOXIDE_API_KEY);
    restoreEnv("CLIENT_URL", previous.CLIENT_URL);
    restoreEnv("NODE_ENV", previous.NODE_ENV);
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("keeps keys out of health, session, and error bodies and sets safe headers", async () => {
    const health = await fetch(`${baseUrl}/api/health`, {
      headers: { origin: "https://evil.example" },
    });
    const healthText = await health.text();
    expect(health.status).toBe(200);
    expect(healthText).not.toContain(SECRET);
    expect(health.headers.get("x-powered-by")).toBeNull();
    expect(health.headers.get("x-content-type-options")).toBe("nosniff");
    expect(health.headers.get("x-frame-options")).toBe("DENY");
    expect(health.headers.get("referrer-policy")).toBe("no-referrer");
    expect(health.headers.get("cache-control")).toBe("no-store");
    expect(health.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    expect(health.headers.get("access-control-allow-origin")).not.toBe("https://evil.example");

    const session = await fetch(`${baseUrl}/api/voice/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user_sec", language: "en", text: "secret transcript" }),
    });
    const sessionText = await session.text();
    expect(session.status).toBe(201);
    expect(sessionText).not.toContain(SECRET);
    expect(sessionText).not.toContain("secret transcript");

    const missing = await fetch(`${baseUrl}/api/does-not-exist`);
    const missingText = await missing.text();
    expect(missing.status).toBe(404);
    expect(missingText).not.toContain(SECRET);
  });
});

describe("production CORS", () => {
  let closeServer: (() => Promise<void>) | undefined;
  const previous = {
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
    restoreEnv("CLIENT_URL", previous.CLIENT_URL);
    restoreEnv("NODE_ENV", previous.NODE_ENV);
  });

  it("does not fall back to localhost when CLIENT_URL is unset in production", async () => {
    delete process.env.CLIENT_URL;
    process.env.NODE_ENV = "production";

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
    const baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;

    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { origin: "http://localhost:3000" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
