import type { Request, Response, NextFunction } from "express";

export function allowedCorsOrigin(): string | boolean {
  const configured = process.env.CLIENT_URL?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return false;
  return "http://localhost:3000";
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  next();
}
