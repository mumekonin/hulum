import type { ErrorRequestHandler, RequestHandler } from "express";
import { fail } from "./envelope.js";
import { HttpError } from "./errors.js";
import { redactSecrets } from "../security/redact.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(fail("NOT_FOUND", "The requested resource was not found."));
};

function isJsonSyntaxError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) {
    return false;
  }
  if (!("body" in err) && (err as { type?: string }).type !== "entity.parse.failed") {
    return (err as { status?: number }).status === 400;
  }
  return true;
}

function isPayloadTooLarge(err: unknown): boolean {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const typed = err as { status?: number; type?: string; statusCode?: number };
  return typed.status === 413 || typed.statusCode === 413 || typed.type === "entity.too.large";
}

/** Postgres / pool connection failures — safe 503, no connection string in the body. */
export function isDatabaseFailure(err: unknown): boolean {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const typed = err as { code?: string; message?: string };
  const code = typed.code ?? "";
  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "57P01" ||
    code === "57P03" ||
    code === "08006" ||
    code === "08001" ||
    code === "28P01"
  ) {
    return true;
  }
  const message = typed.message ?? "";
  return /ECONNREFUSED|connection refused|Connection terminated|timeout expired|no pg_hba|password authentication failed|the database system is (starting up|shutting down)|connect ETIMEDOUT|getaddrinfo ENOTFOUND/i.test(
    message,
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json(fail(err.code, redactSecrets(err.message)));
    return;
  }

  if (isJsonSyntaxError(err)) {
    res.status(400).json(fail("INVALID_INPUT", "Request body must be valid JSON."));
    return;
  }

  if (isPayloadTooLarge(err)) {
    res.status(413).json(fail("PAYLOAD_TOO_LARGE", "Request body is too large."));
    return;
  }

  if (isDatabaseFailure(err)) {
    const raw = err instanceof Error ? err.message : "database unavailable";
    console.error(redactSecrets(raw));
    res
      .status(503)
      .json(
        fail(
          "DATABASE_UNAVAILABLE",
          "HULUM could not reach the database. Try again in a moment — your profile and decisions were not invented.",
        ),
      );
    return;
  }

  const raw = err instanceof Error ? err.message : "Something went wrong.";
  console.error(redactSecrets(raw));
  res.status(500).json(fail("INTERNAL_ERROR", "Something went wrong. Please try again."));
};
