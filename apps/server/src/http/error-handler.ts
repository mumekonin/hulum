import type { ErrorRequestHandler, RequestHandler } from "express";
import { fail } from "./envelope.js";
import { HttpError } from "./errors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(fail("NOT_FOUND", "The requested resource was not found."));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json(fail(err.code, err.message));
    return;
  }

  res.status(500).json(fail("INTERNAL_ERROR", "Something went wrong. Please try again."));
};
