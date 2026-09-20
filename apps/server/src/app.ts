import express from "express";
import { loadEnv, type AppEnv } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./http/error-handler.js";
import { createApiRouter } from "./routes/index.js";
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
};

export function createApp(options: CreateAppOptions = {}): express.Express {
  const env = options.env ?? loadEnv();
  const limiter =
    options.explainLimiter ??
    createRateLimiter({
      windowMs: EXPLAIN_RATE_LIMIT_WINDOW_MS,
      max: EXPLAIN_RATE_LIMIT_MAX,
    });

  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use(corsMiddleware(env));
  app.use(express.json({ limit: "100kb" }));
  app.use(explainRateLimitMiddleware(limiter));
  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
