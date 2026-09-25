import type { AuthSession } from "@hulum/shared";
import { loadEnv, type AppEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { issueAuthSessionToken, verifySessionToken, authSigningSecret } from "../security/session.js";
import type { GoogleProfile } from "./google.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { AuthStore } from "./store.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type AuthService = {
  register(input: { name: string; email: string; password: string }): Promise<AuthSession>;
  login(input: { email: string; password: string }): Promise<AuthSession>;
  loginWithGoogle(profile: GoogleProfile): Promise<AuthSession>;
  me(token: string): Promise<AuthSession>;
};

function toSession(user: { id: string; name: string; email: string }, env: AppEnv): AuthSession {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    sessionToken: issueAuthSessionToken(user.id, env),
  };
}

export function createAuthService(store: AuthStore, env: AppEnv = loadEnv({ fromFile: false })): AuthService {
  return {
    async register(input): Promise<AuthSession> {
      const name = input.name.trim();
      const email = normalizeEmail(input.email);
      if (name.length < 2) {
        throw new HttpError(400, "INVALID_INPUT", "Name must be at least 2 characters.");
      }
      if (!EMAIL_PATTERN.test(email)) {
        throw new HttpError(400, "INVALID_INPUT", "Email must be a valid address.");
      }
      const existing = await store.findByEmail(email);
      if (existing !== undefined) {
        throw new HttpError(409, "CONFLICT", "An account with this email already exists. Sign in instead.");
      }
      let passwordHash: string;
      try {
        passwordHash = await hashPassword(input.password);
      } catch {
        throw new HttpError(400, "INVALID_INPUT", "Password must be at least 8 characters.");
      }
      const user = await store.createUser({ name, email, passwordHash });
      await store.createEmptyProfile(user.id);
      return toSession(user, env);
    },

    async login(input): Promise<AuthSession> {
      const email = normalizeEmail(input.email);
      const user = await store.findByEmail(email);
      if (user === undefined || user.password_hash === null) {
        throw new HttpError(401, "UNAUTHORIZED", "Email or password is incorrect.");
      }
      const ok = await verifyPassword(input.password, user.password_hash);
      if (!ok) {
        throw new HttpError(401, "UNAUTHORIZED", "Email or password is incorrect.");
      }
      return toSession(user, env);
    },

    async loginWithGoogle(profile): Promise<AuthSession> {
      const email = normalizeEmail(profile.email);
      if (!EMAIL_PATTERN.test(email)) {
        throw new HttpError(401, "UNAUTHORIZED", "Google did not return a valid email address.");
      }
      const byGoogle = await store.findByGoogleSub(profile.sub);
      if (byGoogle !== undefined) {
        return toSession(byGoogle, env);
      }
      const existing = await store.findByEmail(email);
      if (existing !== undefined) {
        if (existing.google_sub !== null && existing.google_sub !== profile.sub) {
          throw new HttpError(409, "CONFLICT", "This email is already linked to a different Google account.");
        }
        if (existing.google_sub === null) {
          await store.linkGoogleSub(existing.id, profile.sub);
        }
        return toSession(existing, env);
      }
      const user = await store.createUser({
        name: profile.name.trim().length >= 2 ? profile.name.trim() : email.split("@")[0] ?? "HULUM user",
        email,
        passwordHash: null,
        googleSub: profile.sub,
      });
      await store.createEmptyProfile(user.id);
      return toSession(user, env);
    },

    async me(token: string): Promise<AuthSession> {
      const userId = verifySessionToken(token, authSigningSecret(env));
      const user = await store.findById(userId);
      if (user === undefined) {
        throw new HttpError(401, "UNAUTHORIZED", "Session is not valid.");
      }
      return toSession(user, env);
    },
  };
}
