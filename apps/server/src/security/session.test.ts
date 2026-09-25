import { describe, expect, it } from "vitest";
import { HttpError } from "../http/errors.js";
import {
  assertRequestSession,
  issueSessionToken,
  isSessionEnforced,
  verifySessionToken,
} from "./session.js";

describe("session tokens", () => {
  const secret = "test-session-secret-not-for-prod";
  const userId = "11111111-1111-4111-8111-111111111111";

  it("round-trips a user id", () => {
    const token = issueSessionToken(userId, secret);
    expect(verifySessionToken(token, secret)).toBe(userId);
  });

  it("rejects a tampered token", () => {
    const token = issueSessionToken(userId, secret);
    expect(() => verifySessionToken(`${token}x`, secret)).toThrow(HttpError);
  });

  it("enforces only when secret is set (or production)", () => {
    expect(isSessionEnforced({ NODE_ENV: "development", SESSION_SECRET: undefined })).toBe(false);
    expect(isSessionEnforced({ NODE_ENV: "development", SESSION_SECRET: secret })).toBe(true);
    expect(isSessionEnforced({ NODE_ENV: "production", SESSION_SECRET: secret })).toBe(true);
  });

  it("assertRequestSession allows open local mode", () => {
    const req = { header: () => undefined } as never;
    expect(() =>
      assertRequestSession(req, userId, {
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
        SESSION_SECRET: undefined,
        GOOGLE_CLIENT_ID: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
      }),
    ).not.toThrow();
  });

  it("assertRequestSession rejects mismatched session", () => {
    const token = issueSessionToken(userId, secret);
    const req = { header: (name: string) => (name === "x-hulum-session" ? token : undefined) } as never;
    const other = "22222222-2222-4222-8222-222222222222";
    expect(() =>
      assertRequestSession(req, other, {
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
        SESSION_SECRET: secret,
        GOOGLE_CLIENT_ID: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
      }),
    ).toThrow(/does not match/);
  });
});
