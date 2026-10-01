import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { allowedOrigins, corsMiddleware } from "./cors.js";

describe("corsMiddleware", () => {
  it("allows every method the API routes use, including DELETE", () => {
    const headers = new Map<string, string>();
    const res = {
      setHeader: (name: string, value: string) => headers.set(name, value),
      status: () => ({ end: () => undefined }),
    } as unknown as Response;
    const req = { method: "OPTIONS", headers: { origin: "http://localhost:3000" } } as Request;
    corsMiddleware({ NODE_ENV: "development", CLIENT_URL: undefined })(req, res, () => undefined);
    const methods = headers.get("Access-Control-Allow-Methods")?.split(",") ?? [];
    expect(methods).toEqual(expect.arrayContaining(["GET", "POST", "PATCH", "DELETE"]));
  });
});

describe("allowedOrigins", () => {
  it("uses CLIENT_URL when set", () => {
    expect(
      allowedOrigins({ NODE_ENV: "production", CLIENT_URL: "https://hulum.example.invalid" }),
    ).toEqual(["https://hulum.example.invalid"]);
  });

  it("allows local web origins in development when CLIENT_URL is unset", () => {
    expect(allowedOrigins({ NODE_ENV: "development", CLIENT_URL: undefined })).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });

  it("allows no browser origins in production when CLIENT_URL is unset", () => {
    expect(allowedOrigins({ NODE_ENV: "production", CLIENT_URL: undefined })).toEqual([]);
  });
});
