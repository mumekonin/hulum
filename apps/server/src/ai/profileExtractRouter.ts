import { Router } from "express";
import { ok } from "@hulum/shared";
import { z } from "zod";
import { createGroqChatClient, type ChatClient } from "./groq.js";
import {
  buildProfileExtractMessages,
  emptyProfileExtract,
  profileExtractFromModelText,
} from "./profileExtract.js";
import { loadEnv } from "../config/env.js";
import { HttpError } from "../http/errors.js";

const extractBodySchema = z.object({
  text: z.string().trim().min(8).max(4000),
});

function optionalChat(): ChatClient | undefined {
  const env = loadEnv();
  if (env.GROQ_API_KEY === undefined || env.GROQ_MODEL === undefined) {
    return undefined;
  }
  return createGroqChatClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL });
}

export function createProfileExtractRouter(chat?: ChatClient): Router {
  const router = Router();
  const getChat = (): ChatClient | undefined => chat ?? optionalChat();

  router.post("/profile-extract", async (req, res, next) => {
    try {
      const parsed = extractBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(
          422,
          "INVALID_INPUT",
          "Provide a self-description text (at least a short sentence).",
        );
      }

      const client = getChat();
      if (client === undefined) {
        throw new HttpError(
          503,
          "AI_UNAVAILABLE",
          "GROQ_API_KEY and GROQ_MODEL must be set in the server environment.",
        );
      }

      let raw = "";
      try {
        raw = await client.complete(buildProfileExtractMessages(parsed.data.text));
      } catch (error) {
        if (!(error instanceof HttpError) || error.code !== "AI_ERROR") {
          throw error;
        }
        try {
          raw = await client.complete(buildProfileExtractMessages(parsed.data.text));
        } catch (retryError) {
          if (!(retryError instanceof HttpError) || retryError.code !== "AI_ERROR") {
            throw retryError;
          }
          raw = "";
        }
      }

      // Never persist here — confirmation happens via profile create/patch only.
      const result = raw ? profileExtractFromModelText(raw) : emptyProfileExtract();
      res.status(200).json(ok(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const profileExtractRouter = createProfileExtractRouter();
