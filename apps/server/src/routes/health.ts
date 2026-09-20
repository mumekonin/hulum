import { Router } from "express";
import type { Request, Response } from "express";
import { ok } from "../lib/http.js";

export function health(_req: Request, res: Response) {
  ok(res, {
    status: "ok",
    service: "hulum-api",
    time: new Date().toISOString(),
  });
}

export const healthRouter = Router();
healthRouter.get("/", health);
