import { Router } from "express";
import { ok } from "@hulum/shared";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { issueOauthState, verifyOauthState } from "../security/jwt.js";
import { SESSION_HEADER, authSigningSecret } from "../security/session.js";
import { exchangeGoogleCode, googleAuthorizeUrl, googleRedirectUri } from "./google.js";
import { createAuthService, type AuthService } from "./service.js";
import { createPgAuthStore } from "./store.js";

function asText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "INVALID_INPUT", `${field} is required.`);
  }
  return value;
}

function defaultService(): AuthService {
  return createAuthService(createPgAuthStore());
}

function clientOrigin(): string {
  return loadEnv({ fromFile: false }).CLIENT_URL ?? "http://localhost:3000";
}

export function createAuthRouter(service?: AuthService): Router {
  const router = Router();
  const getService = (): AuthService => service ?? defaultService();

  router.post("/register", async (req, res, next) => {
    try {
      const body = req.body as Record<string, unknown>;
      const session = await getService().register({
        name: asText(body.name, "name"),
        email: asText(body.email, "email"),
        password: asText(body.password, "password"),
      });
      res.status(201).json(ok(session));
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const body = req.body as Record<string, unknown>;
      const session = await getService().login({
        email: asText(body.email, "email"),
        password: asText(body.password, "password"),
      });
      res.status(200).json(ok(session));
    } catch (error) {
      next(error);
    }
  });

  router.get("/google", (_req, res, next) => {
    try {
      const env = loadEnv({ fromFile: false });
      if (env.GOOGLE_CLIENT_ID === undefined || env.GOOGLE_CLIENT_SECRET === undefined) {
        res.redirect(`${clientOrigin()}/?auth_error=google_unconfigured`);
        return;
      }
      const state = issueOauthState(authSigningSecret(env));
      res.redirect(
        googleAuthorizeUrl({
          clientId: env.GOOGLE_CLIENT_ID,
          redirectUri: googleRedirectUri(env.PORT),
          state,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/google/callback", async (req, res) => {
    const origin = clientOrigin();
    try {
      const env = loadEnv({ fromFile: false });
      if (env.GOOGLE_CLIENT_ID === undefined || env.GOOGLE_CLIENT_SECRET === undefined) {
        throw new HttpError(503, "CONFIG", "Google sign-in is not configured.");
      }
      if (typeof req.query.error === "string" && req.query.error !== "") {
        res.redirect(`${origin}/?auth_error=google_denied`);
        return;
      }
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      if (code === "" || state === "") {
        throw new HttpError(400, "INVALID_INPUT", "Google sign-in did not return a code.");
      }
      verifyOauthState(state, authSigningSecret(env));
      const profile = await exchangeGoogleCode({
        code,
        redirectUri: googleRedirectUri(env.PORT),
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      });
      const session = await getService().loginWithGoogle(profile);
      const token = encodeURIComponent(session.sessionToken);
      res.redirect(`${origin}/auth/callback#token=${token}`);
    } catch {
      res.redirect(`${origin}/?auth_error=google_failed`);
    }
  });

  router.get("/me", async (req, res, next) => {
    try {
      const header = req.header(SESSION_HEADER);
      if (header === undefined || header.trim() === "") {
        throw new HttpError(401, "UNAUTHORIZED", "Sign in to continue.");
      }
      const session = await getService().me(header.trim());
      res.status(200).json(ok(session));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const authRouter = createAuthRouter();
