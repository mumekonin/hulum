import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { HttpError } from "../http/errors.js";

export const JWT_TTL_SECONDS = 7 * 24 * 60 * 60;
export const OAUTH_STATE_TTL_SECONDS = 10 * 60;

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function issueJwt(
  claims: Record<string, unknown>,
  secret: string,
  ttlSeconds: number = JWT_TTL_SECONDS,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({ ...claims, iat: now, exp: now + ttlSeconds });
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, secret)}`;
}

export function verifyJwt(token: string, secret: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] === undefined || parts[1] === undefined || parts[2] === undefined) {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  const body = `${parts[0]}.${parts[1]}`;
  const expected = sign(body, secret);
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  if (typeof payload !== "object" || payload === null) {
    throw new HttpError(401, "UNAUTHORIZED", "Session token is missing or invalid.");
  }
  const claims = payload as Record<string, unknown>;
  if (typeof claims.exp !== "number" || claims.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "UNAUTHORIZED", "Session has expired. Sign in again.");
  }
  return claims;
}

export function issueOauthState(secret: string): string {
  return issueJwt({ typ: "oauth_state", n: randomBytes(16).toString("hex") }, secret, OAUTH_STATE_TTL_SECONDS);
}

export function verifyOauthState(token: string, secret: string): void {
  const claims = verifyJwt(token, secret);
  if (claims.typ !== "oauth_state") {
    throw new HttpError(401, "UNAUTHORIZED", "Google sign-in state is invalid.");
  }
}
