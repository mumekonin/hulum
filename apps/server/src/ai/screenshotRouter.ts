import { Router } from "express";
import { ok } from "@hulum/shared";
import { z } from "zod";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { createPgProfileStore } from "../profiles/store.js";
import { assertRequestSession } from "../security/session.js";
import { systemClock } from "../services/common/clock.js";
import { completeGroqVision, DEFAULT_GROQ_VISION_MODEL } from "./groq.js";
import { analyzeScreenshotExtract } from "./screenshotAnalyze.js";
import { EMPTY_SCREENSHOT_EXTRACT, SCREENSHOT_EXTRACT_SYSTEM, screenshotExtractFromModelText } from "./screenshotExtract.js";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BASE64_CHARS = 5_500_000;

const bodySchema = z.object({
  userId: z.string().uuid(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  imageBase64: z.string().min(80).max(MAX_BASE64_CHARS),
});

const EXTRACT_PROMPT = `${SCREENSHOT_EXTRACT_SYSTEM}
Return JSON with keys: title, organization, type (scholarship|fellowship|internship|job|grant|competition or null), description, deadline (YYYY-MM-DD or null), countryEligibility, educationRequirements, fieldRequirements, experienceRequirements, languageRequirements, documentRequirements (arrays), applicationUrl, sourceUrl (http/https only or null), visibleText (short readable text from the photo).`;

export function createScreenshotRouter(): Router {
  const router = Router();

  router.post("/screenshot-analyze", async (req, res, next) => {
    try {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(
          422,
          "INVALID_INPUT",
          "Upload a JPEG, PNG, or WebP screenshot (about 4 MB or smaller).",
        );
      }
      const { userId, mimeType, imageBase64 } = parsed.data;
      if (!isUuid(userId)) {
        throw new HttpError(400, "INVALID_ID", "User id must be a UUID.");
      }
      assertRequestSession(req, userId);
      if (!ALLOWED_TYPES.has(mimeType)) {
        throw new HttpError(422, "INVALID_INPUT", "Use a JPEG, PNG, or WebP photo.");
      }
      const compact = imageBase64.replace(/\s/g, "");
      if (!/^[A-Za-z0-9+/=]+$/.test(compact)) {
        throw new HttpError(422, "INVALID_INPUT", "The photo data was not valid.");
      }

      const env = loadEnv({ fromFile: false });
      if (env.GROQ_API_KEY === undefined) {
        throw new HttpError(503, "AI_UNAVAILABLE", "GROQ_API_KEY must be set to read screenshots.");
      }

      let raw = "";
      try {
        raw = await completeGroqVision({
          apiKey: env.GROQ_API_KEY,
          model: env.GROQ_VISION_MODEL ?? DEFAULT_GROQ_VISION_MODEL,
          prompt: EXTRACT_PROMPT,
          imageDataUrl: `data:${mimeType};base64,${compact}`,
        });
      } catch (error) {
        if (!(error instanceof HttpError) || error.code !== "AI_ERROR") {
          throw error;
        }
        raw = "";
      }

      const extracted = raw === "" ? { ...EMPTY_SCREENSHOT_EXTRACT } : screenshotExtractFromModelText(raw);
      const stored = await createPgProfileStore().getByUserId(userId);
      const result = analyzeScreenshotExtract(extracted, stored?.profile, systemClock);
      res.status(200).json(ok(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const screenshotRouter = createScreenshotRouter();
