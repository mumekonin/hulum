import type { ErrorRequestHandler, Response } from "express";
import type { ApiResponse } from "@hulum/shared";

export function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiResponse<T> = { data, error: null };
  res.status(status).json(body);
}

export function fail(res: Response, message: string, status = 400, code?: string) {
  const body: ApiResponse<null> = { data: null, error: { message, code } };
  res.status(status).json(body);
}

function errorType(err: unknown): string {
  if (err && typeof err === "object" && "type" in err) {
    return String((err as { type: unknown }).type);
  }
  return "";
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const type = errorType(err);
  if (err instanceof SyntaxError || type === "entity.parse.failed") {
    fail(res, "Request body is not valid JSON.", 400, "INVALID_JSON");
    return;
  }
  if (type === "entity.too.large") {
    fail(res, "Request is too large.", 413, "PAYLOAD_TOO_LARGE");
    return;
  }

  fail(res, "Something went wrong. Try again.", 500, "INTERNAL");
};
