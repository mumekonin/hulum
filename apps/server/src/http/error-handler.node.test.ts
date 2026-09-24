import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { errorHandler, isDatabaseFailure } from "./error-handler.js";
import { HttpError } from "./errors.js";

function capture(): {
  req: Request;
  res: Response;
  next: NextFunction;
  statusCode: () => number;
  body: () => unknown;
} {
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

describe("errorHandler database failures (Phase 20)", () => {
  it("detects connection refused as a database failure", () => {
    const err = new Error("connect ECONNREFUSED 127.0.0.1:5432");
    (err as { code?: string }).code = "ECONNREFUSED";
    assert.equal(isDatabaseFailure(err), true);
  });

  it("maps Postgres connection refusal to 503 DATABASE_UNAVAILABLE without leaking the URL", () => {
    const http = capture();
    const err = new Error("connect ECONNREFUSED 127.0.0.1:5432");
    (err as { code?: string }).code = "ECONNREFUSED";
    errorHandler(err, http.req, http.res, http.next);
    assert.equal(http.statusCode(), 503);
    assert.deepEqual(http.body(), {
      data: null,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message:
          "HULUM could not reach the database. Try again in a moment — your profile and decisions were not invented.",
      },
    });
    assert.equal(JSON.stringify(http.body()).includes("5432"), false);
  });

  it("still redacts secrets on HttpError without treating every 503 as a DB failure", () => {
    const http = capture();
    errorHandler(
      new HttpError(503, "AI_UNAVAILABLE", "Bearer gsk_liveabc failed"),
      http.req,
      http.res,
      http.next,
    );
    assert.equal(http.statusCode(), 503);
    assert.deepEqual(http.body(), {
      data: null,
      error: { code: "AI_UNAVAILABLE", message: "[redacted] failed" },
    });
  });
});
