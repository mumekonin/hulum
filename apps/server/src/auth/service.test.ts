import { randomUUID } from "node:crypto";
import type { AppEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { describe, expect, it } from "vitest";
import { createAuthService } from "./service.js";
import type { AuthStore, AuthUserRow } from "./store.js";

const env: AppEnv = {
  NODE_ENV: "test",
  PORT: 3001,
  CLIENT_URL: undefined,
  DATABASE_URL: undefined,
  SUPABASE_URL: undefined,
  SUPABASE_ANON_KEY: undefined,
  SUPABASE_SERVICE_ROLE_KEY: undefined,
  CLAUDE_API_KEY: undefined,
  CLAUDE_MODEL: undefined,
  GROQ_API_KEY: undefined,
  GROQ_MODEL: undefined,
  GROQ_VISION_MODEL: undefined,
  VOXIDE_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_URL: undefined,
  INVESTIGATE_ADMIN_SECRET: undefined,
  SCHOLARXIV_API_KEY: undefined,
  SESSION_SECRET: "test-auth-secret",
  GOOGLE_CLIENT_ID: undefined,
  GOOGLE_CLIENT_SECRET: undefined,
};

function memoryStore(): AuthStore {
  const byId = new Map<string, AuthUserRow>();
  const byEmail = new Map<string, AuthUserRow>();
  const byGoogle = new Map<string, AuthUserRow>();
  return {
    async createUser(input) {
      if (byEmail.has(input.email)) {
        throw new HttpError(409, "CONFLICT", "An account with this email already exists. Sign in instead.");
      }
      const row: AuthUserRow = {
        id: randomUUID(),
        name: input.name,
        email: input.email,
        password_hash: input.passwordHash,
        google_sub: input.googleSub ?? null,
      };
      byId.set(row.id, row);
      byEmail.set(row.email, row);
      if (row.google_sub) byGoogle.set(row.google_sub, row);
      return row;
    },
    async findByEmail(email) {
      return byEmail.get(email.toLowerCase());
    },
    async findById(id) {
      return byId.get(id);
    },
    async findByGoogleSub(googleSub) {
      return byGoogle.get(googleSub);
    },
    async linkGoogleSub(userId, googleSub) {
      const row = byId.get(userId);
      if (row === undefined) return;
      row.google_sub = googleSub;
      byGoogle.set(googleSub, row);
    },
    async createEmptyProfile() {
      return;
    },
  };
}

describe("auth service", () => {
  it("registers, logs in, and returns the same user from the session", async () => {
    const service = createAuthService(memoryStore(), env);
    const created = await service.register({
      name: "Abeba Tesfaye",
      email: "Abeba@Example.invalid",
      password: "strong-pass",
    });
    expect(created.email).toBe("abeba@example.invalid");
    expect(created.sessionToken.length).toBeGreaterThan(10);

    const loggedIn = await service.login({
      email: "abeba@example.invalid",
      password: "strong-pass",
    });
    expect(loggedIn.userId).toBe(created.userId);

    const me = await service.me(loggedIn.sessionToken);
    expect(me.userId).toBe(created.userId);
    expect(me.name).toBe("Abeba Tesfaye");
  });

  it("rejects a duplicate email", async () => {
    const service = createAuthService(memoryStore(), env);
    await service.register({ name: "One", email: "same@example.invalid", password: "strong-pass" });
    await expect(
      service.register({ name: "Two", email: "same@example.invalid", password: "other-pass" }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });

  it("rejects a wrong password without revealing whether the email exists", async () => {
    const service = createAuthService(memoryStore(), env);
    await service.register({ name: "One", email: "one@example.invalid", password: "strong-pass" });
    await expect(service.login({ email: "one@example.invalid", password: "nope-nope" })).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
    await expect(service.login({ email: "missing@example.invalid", password: "strong-pass" })).rejects.toMatchObject({
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("creates a Google user and later links the same email to a password account", async () => {
    const store = memoryStore();
    const service = createAuthService(store, env);
    const created = await service.loginWithGoogle({
      sub: "google-sub-1",
      email: "linked@example.invalid",
      name: "Linked User",
    });
    expect(created.email).toBe("linked@example.invalid");
    expect(created.sessionToken.split(".").length).toBe(3);

    const again = await service.loginWithGoogle({
      sub: "google-sub-1",
      email: "linked@example.invalid",
      name: "Linked User",
    });
    expect(again.userId).toBe(created.userId);
  });

  it("links Google onto an existing password account with the same email", async () => {
    const service = createAuthService(memoryStore(), env);
    const password = await service.register({
      name: "Same Person",
      email: "same.person@example.invalid",
      password: "strong-pass",
    });
    const google = await service.loginWithGoogle({
      sub: "google-sub-2",
      email: "same.person@example.invalid",
      name: "Same Person",
    });
    expect(google.userId).toBe(password.userId);
  });
});
