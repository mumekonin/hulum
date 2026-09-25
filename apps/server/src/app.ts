import cors from "cors";
import express from "express";
import { loadEnv, type AppEnv } from "./config/env.js";
import { errorHandler as postgresErrorHandler, notFoundHandler } from "./http/error-handler.js";
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
  EXPLAIN_RATE_LIMIT_MAX,
  EXPLAIN_RATE_LIMIT_WINDOW_MS,
  corsMiddleware,
  createRateLimiter,
  explainRateLimitMiddleware,
  type RateLimiter,
} from "./security/index.js";

export type CreateAppOptions = {
  env?: AppEnv;
  explainLimiter?: RateLimiter;
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

    app.use((_req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      next();
    });
    app.use(corsMiddleware(env));
    app.use((req, res, next) => {
      const isScreenshot = req.path === "/api/ai/screenshot-analyze";
      const isDocumentUpload =
        req.method === "POST" && /^\/api\/profile\/[^/]+\/documents$/.test(req.path);
      if (isScreenshot || isDocumentUpload) {
        express.json({ limit: "5mb" })(req, res, next);
        return;
      }
      express.json({ limit: "100kb" })(req, res, next);
    });
    app.use(opsRequestTimingMiddleware());
    app.use(explainRateLimitMiddleware(limiter));
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
