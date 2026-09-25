import type { NextFunction, Request, RequestHandler, Response } from "express";
import { recordOpsEvent } from "./metrics.js";

/** Family labels only — never log bodies, user ids, or query values. */
function routeFamily(path: string): string {
  if (path.startsWith("/api/health") || path === "/api/health") return "health";
  if (path.startsWith("/api/ops")) return "ops";
  if (path.startsWith("/api/auth")) return "auth";
  if (path.startsWith("/api/profile")) return "profile";
  if (path.startsWith("/api/opportunities")) return "opportunities";
  if (path.startsWith("/api/analyses")) return "analyses";
  if (path.startsWith("/api/readiness")) return "readiness";
  if (path.startsWith("/api/investigate")) return "investigate";
  if (path.startsWith("/api/research")) return "research";
  if (path.startsWith("/api/voice")) return "voice";
  if (path.startsWith("/api")) return "api_other";
  return "other";
}

export function opsRequestTimingMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const started = Date.now();
    const family = routeFamily(req.path);

    res.on("finish", () => {
      if (family === "ops" || family === "health") {
        return;
      }
      const status = res.statusCode;
      const ok = status < 400;
      recordOpsEvent({
        kind: "api",
        name: `${req.method} ${family}`,
        ok,
        ms: Date.now() - started,
        ...(ok ? {} : { code: `HTTP_${status}` }),
      });
    });

    next();
  };
}
