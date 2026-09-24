import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import type { AppEnv } from "../config/env.js";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";

const HEADER = "x-hulum-session";

/** True when SESSION_SECRET is set, or always in production (secret required there). */
export function isSessionEnforced(env: Pick<AppEnv, "NODE_ENV" | "SESSION_SECRET"> = loadEnv({ fromFile: false })): boolean {
  if (env.NODE_ENV === "production") {
    return true;
  }
  return env.SESSION_SECRET !== undefined;
}

export function issueSessionToken(userId: string, secret: string): string {
  const body = Buffer.from(userId, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(userId).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): string {
  const parts = token.split(".");
  if (parts.length !== 2 || parts[0] === undefined || parts[1] === undefined) {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  let userId: string;
  try {
    userId = Buffer.from(parts[0], "base64url").toString("utf8");
  } catch {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  if (userId.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  const expected = createHmac("sha256", secret).update(userId).digest("base64url");
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  return userId;
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

export const SESSION_HEADER = HEADER;
