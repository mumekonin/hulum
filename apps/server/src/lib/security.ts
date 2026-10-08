import type { Request, Response, NextFunction } from "express";

const PERMISSIONS_POLICY = "camera=(), geolocation=(), payment=(), usb=()";

export function allowedCorsOrigin(): string | boolean {
  const configured = process.env.CLIENT_URL?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") return false;
  return "http://localhost:3000";
}

export function applySecurityHeaders(res: Response): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  applySecurityHeaders(res);
  next();
}
