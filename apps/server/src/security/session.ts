import type { Request } from "express";
import type { AppEnv } from "../config/env.js";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { issueJwt, verifyJwt } from "./jwt.js";

const HEADER = "x-hulum-session";

/** True when SESSION_SECRET is set, or always in production (secret required there). */
export function isSessionEnforced(env: Pick<AppEnv, "NODE_ENV" | "SESSION_SECRET"> = loadEnv({ fromFile: false })): boolean {
  if (env.NODE_ENV === "production") {
    return true;
  }
  return env.SESSION_SECRET !== undefined;
}

export function issueSessionToken(userId: string, secret: string): string {
  return issueJwt({ sub: userId, typ: "session" }, secret);
}

export function verifySessionToken(token: string, secret: string): string {
  const claims = verifyJwt(token, secret);
  if (claims.typ !== "session" || typeof claims.sub !== "string" || claims.sub.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  return claims.sub;
}

/**
 * When session auth is enforced, require `X-Hulum-Session` to match `userId`.
 * Local demo without SESSION_SECRET stays open (UUID in the body/path only).
 */
export function assertRequestSession(req: Request, userId: string, env: AppEnv = loadEnv({ fromFile: false })): void {
  if (!isSessionEnforced(env)) {
    return;
  }
  const secret = env.SESSION_SECRET;
  if (secret === undefined) {
    throw new HttpError(500, "CONFIG", "SESSION_SECRET is required when session auth is enforced.");
  }
  const header = req.header(HEADER);
  if (header === undefined || header.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "X-Hulum-Session header is required.");
  }
  const subject = verifySessionToken(header.trim(), secret);
  if (subject !== userId) {
    throw new HttpError(403, "FORBIDDEN", "Session does not match this user.");
  }
}

export function maybeIssueSessionToken(
  userId: string,
  env: AppEnv = loadEnv({ fromFile: false }),
): string | undefined {
  if (env.SESSION_SECRET === undefined) {
    return undefined;
  }
  return issueSessionToken(userId, env.SESSION_SECRET);
}

/** Login/register always need a signing secret. Production still requires SESSION_SECRET. */
export function authSigningSecret(env: AppEnv = loadEnv({ fromFile: false })): string {
  if (env.SESSION_SECRET !== undefined) {
    return env.SESSION_SECRET;
  }
  if (env.NODE_ENV === "production") {
    throw new HttpError(500, "CONFIG", "SESSION_SECRET is required for authentication in production.");
  }
  return "hulum-dev-session-not-for-production";
}

/**
 * Identity for "my …" endpoints that carry no user id in the path or body.
 * Always requires a session, even in open local mode, so one user can never list another's rows.
 */
export function requireSessionUserId(req: Request, env: AppEnv = loadEnv({ fromFile: false })): string {
  const header = req.header(HEADER);
  if (header === undefined || header.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  return verifySessionToken(header.trim(), authSigningSecret(env));
}

export function issueAuthSessionToken(userId: string, env: AppEnv = loadEnv({ fromFile: false })): string {
  return issueSessionToken(userId, authSigningSecret(env));
}

export const SESSION_HEADER = HEADER;
