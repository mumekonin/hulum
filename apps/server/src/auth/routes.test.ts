import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { AuthSession } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { createAuthRouter } from "./routes.js";
import type { AuthService } from "./service.js";

const session: AuthSession = {
  userId: "11111111-1111-4111-8111-111111111111",
  email: "abeba@example.invalid",
  name: "Abeba Tesfaye",
  sessionToken: "token.example",
};

function createTestApp(service: AuthService): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", createAuthRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("auth routes", () => {
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

  it("registers and logs in", async () => {
    const port = await listen(
      createTestApp({
        register: async () => session,
        login: async () => session,
        loginWithGoogle: async () => session,
        me: async () => session,
      }),
    );
    const created = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Abeba Tesfaye", email: "abeba@example.invalid", password: "strong-pass" }),
    });
    expect(created.status).toBe(201);
    const createdBody = (await created.json()) as { data: AuthSession };
    expect(createdBody.data.userId).toBe(session.userId);

    const loggedIn = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "abeba@example.invalid", password: "strong-pass" }),
    });
    expect(loggedIn.status).toBe(200);
  });

  it("requires a session header for /me", async () => {
    const port = await listen(
      createTestApp({
        register: async () => session,
        login: async () => session,
        loginWithGoogle: async () => session,
        me: async () => session,
      }),
    );
    const missing = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    expect(missing.status).toBe(401);

    const ok = await fetch(`http://127.0.0.1:${port}/api/auth/me`, {
      headers: { "X-Hulum-Session": "token.example" },
    });
    expect(ok.status).toBe(200);
  });

  it("serves password reset request, verify, and confirm", async () => {
    const stubAuth: AuthService = {
      register: async () => session,
      login: async () => session,
      loginWithGoogle: async () => session,
      me: async () => session,
    };
    const confirmed: Array<{ token: string; password: string }> = [];
    const app = express();
    app.use(express.json());
    app.use(
      "/api/auth",
      createAuthRouter(stubAuth, {
        request: async () => {},
        verify: async (token) => (token === "good" ? "valid" : token === "old" ? "expired" : "invalid"),
        confirm: async (input) => {
          confirmed.push(input);
        },
      }),
    );
    app.use(notFoundHandler);
    app.use(errorHandler);
    const port = await listen(app);
    const post = (path: string, body: unknown) =>
      fetch(`http://127.0.0.1:${port}/api/auth/password-reset/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    expect((await post("request", { email: "abeba@example.invalid" })).status).toBe(202);
    expect((await post("request", {})).status).toBe(400);

    expect((await post("verify", { token: "good" })).status).toBe(200);
    const expired = await post("verify", { token: "old" });
    expect(expired.status).toBe(400);
    expect(((await expired.json()) as { error: { code: string } }).error.code).toBe("RESET_LINK_EXPIRED");
    const invalid = await post("verify", { token: "nope" });
    expect(((await invalid.json()) as { error: { code: string } }).error.code).toBe("RESET_LINK_INVALID");

    expect((await post("confirm", { token: "good", password: "new-password" })).status).toBe(200);
    expect(confirmed).toEqual([{ token: "good", password: "new-password" }]);
  });

  it("sends the browser back to sign-in when Google is not configured", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    vi.stubEnv("CLIENT_URL", "http://localhost:3000");
    try {
      const port = await listen(
        createTestApp({
          register: async () => session,
          login: async () => session,
          loginWithGoogle: async () => session,
          me: async () => session,
        }),
      );
      const response = await fetch(`http://127.0.0.1:${port}/api/auth/google`, { redirect: "manual" });
      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("http://localhost:3000/?auth_error=google_unconfigured");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
