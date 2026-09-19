import { isReadinessStatus, type ReadinessStatus } from "@hulum/shared";
import { HttpError } from "../http/errors.js";

export function parsePatchReadinessRequest(body: unknown): { status: ReadinessStatus } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_INPUT", "Request body must be an object.");
  }
  const status = (body as { status?: unknown }).status;
  if (typeof status !== "string" || !isReadinessStatus(status)) {
    throw new HttpError(
      400,
      "INVALID_INPUT",
      "status must be TODO, IN_PROGRESS, DONE, or NOT_REQUIRED.",
    );
  }
  return { status };
}
