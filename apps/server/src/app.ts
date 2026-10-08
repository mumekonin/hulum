import cors from "cors";
import express from "express";
import { loadEnv, type AppEnv } from "./config/env.js";
import { errorHandler as postgresErrorHandler, notFoundHandler } from "./http/error-handler.js";
import { gzipJsonMiddleware } from "./http/gzip.js";
import { createOpsRouter, opsRequestTimingMiddleware } from "./ops/index.js";
import { analysisRouter } from "./routes/analysis.js";
import { health } from "./routes/health.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { profileRouter } from "./routes/profile.js";
import { readinessRouter } from "./routes/readiness.js";
import { voiceRouter } from "./routes/voice.js";
import { createApiRouter } from "./routes/index.js";
import { fail, errorHandler as fileStoreErrorHandler } from "./lib/http.js";
import { allowedCorsOrigin, securityHeaders } from "./lib/security.js";
import {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
  EXPLAIN_RATE_LIMIT_MAX,
  EXPLAIN_RATE_LIMIT_WINDOW_MS,
  authRateLimitMiddleware,
  corsMiddleware,
  createRateLimiter,
  explainRateLimitMiddleware,
  type RateLimiter,
} from "./security/index.js";

export type CreateAppOptions = {
  env?: AppEnv;
  explainLimiter?: RateLimiter;
  authLimiter?: RateLimiter;
  /** Default `postgres` is `npm run dev` (ADR 001). Pass `file` for the JSON demo/tests. */
  store?: "file" | "postgres";
};

export function createApp(options: CreateAppOptions = {}): express.Express {
  const store = options.store ?? "postgres";
  const app = express();
  app.disable("x-powered-by");

  if (store === "postgres") {
    const env = options.env ?? loadEnv({ fromFile: false });
    const limiter =
      options.explainLimiter ??
      createRateLimiter({
        windowMs: EXPLAIN_RATE_LIMIT_WINDOW_MS,
        max: EXPLAIN_RATE_LIMIT_MAX,
      });
    const authLimiter =
      options.authLimiter ??
      createRateLimiter({
        windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
        max: AUTH_RATE_LIMIT_MAX,
      });

    app.use(securityHeaders);
    app.use(corsMiddleware(env));
    app.use(gzipJsonMiddleware());
    app.use((req, res, next) => {
      const isScreenshot = req.path === "/api/ai/screenshot-analyze";
      const isDocumentUpload =
        req.method === "POST" && /^\/api\/profile\/[^/]+\/documents$/.test(req.path);
      if (isScreenshot || isDocumentUpload) {
        // 4 MB file → ~5.4 MB base64 plus JSON keys. 5mb rejected valid uploads.
        express.json({ limit: "8mb" })(req, res, next);
        return;
      }
      express.json({ limit: "100kb" })(req, res, next);
    });
    app.use(opsRequestTimingMiddleware());
    app.use(explainRateLimitMiddleware(limiter));
    app.use(authRateLimitMiddleware(authLimiter));
    app.use("/api", createApiRouter());
    app.use(notFoundHandler);
    app.use(postgresErrorHandler);
    return app;
  }

  app.use(securityHeaders);
  app.use(cors({ origin: allowedCorsOrigin() }));
  app.use(express.json({ limit: "1mb" }));
  app.use(opsRequestTimingMiddleware());

  app.get("/api/health", health);
  app.use("/api/ops", createOpsRouter("file"));
  app.use("/api/profile", profileRouter);
  app.use("/api/opportunities", opportunitiesRouter);
  app.use("/api", analysisRouter);
  app.use("/api/readiness", readinessRouter);
  app.use("/api/voice", voiceRouter);

  app.use((_req, res) => {
    fail(res, "Route not found.", 404, "NOT_FOUND");
  });
  app.use(fileStoreErrorHandler);

  return app;
}
