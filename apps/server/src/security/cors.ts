import type { RequestHandler } from "express";
import type { AppEnv } from "../config/env.js";

const DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"] as const;

export function allowedOrigins(env: Pick<AppEnv, "NODE_ENV" | "CLIENT_URL">): string[] {
  if (env.CLIENT_URL !== undefined) {
    return [env.CLIENT_URL];
  }
  if (env.NODE_ENV === "production") {
    return [];
  }
  return [...DEV_ORIGINS];
}

/**
 * Browser CORS only. Missing Origin (curl, tests) is allowed through.
 * Disallowed origins get no Access-Control-Allow-Origin header.
 */
export function corsMiddleware(env: Pick<AppEnv, "NODE_ENV" | "CLIENT_URL">): RequestHandler {
  const allow = new Set(allowedOrigins(env));

  return (req, res, next) => {
    const origin = req.headers.origin;
    if (typeof origin === "string" && allow.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Hulum-Session, Authorization");
      res.setHeader("Access-Control-Max-Age", "600");
    }

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  };
}
