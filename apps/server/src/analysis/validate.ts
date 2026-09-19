import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";

export function parseAnalyzeRequest(body: unknown): { userId: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_INPUT", "Request body must be an object.");
  }
  const userId = (body as { userId?: unknown }).userId;
  if (typeof userId !== "string" || !isUuid(userId)) {
    throw new HttpError(400, "INVALID_INPUT", "userId must be a UUID.");
  }
  return { userId };
}
