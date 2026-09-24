import type { NextFunction, Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { errorHandler, isDatabaseFailure } from "./error-handler.js";
import { HttpError } from "./errors.js";

function capture(): { req: Request; res: Response; next: NextFunction; statusCode: () => number; body: () => unknown } {
  let statusCode = 0;
  let body: unknown;
  const res = {
    headersSent: false,
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      body = value;
      return this;
    },
  };
  return {
    req: {} as Request,
    res: res as unknown as Response,
    next: (() => {}) as NextFunction,
    statusCode: () => statusCode,
    body: () => body,
  };
}

describe("errorHandler", () => {
  it("returns HttpError as the envelope and redacts secrets in the message", () => {
    const http = capture();
    errorHandler(
      new HttpError(503, "AI_UNAVAILABLE", "Bearer gsk_liveabc failed"),
      http.req,
      http.res,
      http.next,
    );
    expect(http.statusCode()).toBe(503);
    expect(http.body()).toEqual({
      data: null,
      error: { code: "AI_UNAVAILABLE", message: "[redacted] failed" },
    });
  });

  it("maps invalid JSON to 400 without leaking the parse text", () => {
    const http = capture();
    const err = new SyntaxError("Unexpected token gsk_liveabc in JSON");
    (err as { status?: number; type?: string }).status = 400;
    (err as { type?: string }).type = "entity.parse.failed";
    errorHandler(err, http.req, http.res, http.next);
    expect(http.statusCode()).toBe(400);
    expect(http.body()).toEqual({
      data: null,
      error: { code: "INVALID_INPUT", message: "Request body must be valid JSON." },
    });
  });

  it("never puts SQL or keys in a 500 body", () => {
    const http = capture();
    errorHandler(
      new Error("connect postgres://user:secret@db.example.invalid/hulum"),
      http.req,
      http.res,
      http.next,
    );
    expect(http.statusCode()).toBe(500);
    expect(JSON.stringify(http.body()).includes("postgres://")).toBe(false);
    expect(http.body()).toEqual({
      data: null,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
    });
  });

  it("maps Postgres connection refusal to 503 DATABASE_UNAVAILABLE without leaking the URL", () => {
    const http = capture();
    const err = new Error("connect ECONNREFUSED 127.0.0.1:5432");
    (err as { code?: string }).code = "ECONNREFUSED";
    errorHandler(err, http.req, http.res, http.next);
    expect(isDatabaseFailure(err)).toBe(true);
    expect(http.statusCode()).toBe(503);
    expect(http.body()).toEqual({
      data: null,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message:
          "HULUM could not reach the database. Try again in a moment — your profile and decisions were not invented.",
      },
    });
    expect(JSON.stringify(http.body())).not.toMatch(/5432|postgres:\/\//i);
  });

  it("maps oversized bodies to 413", () => {
    const http = capture();
    const err = new Error("request entity too large");
    (err as { status?: number; type?: string }).status = 413;
    (err as { type?: string }).type = "entity.too.large";
    errorHandler(err, http.req, http.res, http.next);
    expect(http.statusCode()).toBe(413);
    expect(http.body()).toEqual({
      data: null,
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." },
    });
  });
});
