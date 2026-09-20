import { isLanguage, Language } from "@hulum/shared";
import { HttpError } from "../http/errors.js";

export function parseExplainRequest(body: unknown): { language: Language } {
  if (body === undefined || body === null) {
    return { language: Language.ENGLISH };
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_INPUT", "Request body must be an object.");
  }
  const language = (body as { language?: unknown }).language;
  if (language === undefined) {
    return { language: Language.ENGLISH };
  }
  if (typeof language !== "string" || !isLanguage(language)) {
    throw new HttpError(400, "INVALID_INPUT", "language must be en, am, or om.");
  }
  return { language };
}
