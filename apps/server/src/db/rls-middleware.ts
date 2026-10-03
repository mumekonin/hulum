import type { NextFunction, Request, Response } from "express";
import { isSessionEnforced, requireSessionUserId } from "../security/session.js";
import { withAppRole, withServiceRls, withUserRls } from "./rls-session.js";

function waitForResponse(res: Response): Promise<void> {
  return new Promise((resolve) => {
    if (res.writableEnded) {
      resolve();
      return;
    }
    const done = (): void => {
      res.off("finish", done);
      res.off("close", done);
      resolve();
    };
    res.on("finish", done);
    res.on("close", done);
  });
}

function trySessionUserId(req: Request): string | undefined {
  try {
    return requireSessionUserId(req);
  } catch {
    return undefined;
  }
}

/**
 * One transaction per request: SET LOCAL ROLE hulum_app so RLS applies.
 * Open local (no SESSION_SECRET) uses service bypass so UUID-in-body demos keep working.
 * Production / SESSION_SECRET: user JWT → user RLS; auth/investigate → bypass; else app role.
 */
export function rlsRequestMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path;

    if (path === "/health" || path.startsWith("/ops")) {
      next();
      return;
    }

    void (async () => {
      const finished = waitForResponse(res);
      try {
        // Auth, investigator, and legacy POST /profile (create user before a session exists).
        if (
          path.startsWith("/auth") ||
          path.startsWith("/investigate") ||
          (req.method === "POST" && path === "/profile")
        ) {
          await withServiceRls(async () => {
            next();
            await finished;
          });
          return;
        }

        if (!isSessionEnforced()) {
          await withServiceRls(async () => {
            next();
            await finished;
          });
          return;
        }

        const userId = trySessionUserId(req);
        if (userId !== undefined) {
          await withUserRls(userId, async () => {
            next();
            await finished;
          });
          return;
        }

        await withAppRole(async () => {
          next();
          await finished;
        });
      } catch (error) {
        next(error);
      }
    })();
  };
}
