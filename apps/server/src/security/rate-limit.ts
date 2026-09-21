import type { RequestHandler } from "express";
import type { Clock } from "../services/common/clock.js";
import { systemClock } from "../services/common/clock.js";
import { HttpError } from "../http/errors.js";

export const EXPLAIN_RATE_LIMIT_WINDOW_MS = 60_000;
export const EXPLAIN_RATE_LIMIT_MAX = 10;

const EXPLAIN_PATH = /^\/api\/analyses\/[^/]+\/explain\/?$/;

export type RateLimiter = {
  allow(key: string): boolean;
};

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  clock?: Clock;
}): RateLimiter {
  const clock = options.clock ?? systemClock;
  const hits = new Map<string, number[]>();

  return {
    allow(key: string): boolean {
      const now = clock.now().getTime();
      const windowStart = now - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((at) => at > windowStart);
      if (recent.length >= options.max) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}

function clientKey(address: string | undefined): string {
  if (address === undefined || address.trim() === "") {
    return "unknown";
  }
  return address;
}

export function explainRateLimitMiddleware(limiter: RateLimiter): RequestHandler {
  return (req, _res, next) => {
    if (req.method !== "POST" || !EXPLAIN_PATH.test(req.path)) {
      next();
      return;
    }
    if (!limiter.allow(clientKey(req.socket.remoteAddress))) {
      next(
        new HttpError(
          429,
          "RATE_LIMITED",
          "Too many explanation requests. Please try again shortly.",
        ),
      );
      return;
    }
    next();
  };
}
