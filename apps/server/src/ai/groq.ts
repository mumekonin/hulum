import { HttpError } from "../http/errors.js";
import { redactSecrets } from "../security/redact.js";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export type ChatCompleteOptions = {
  maxCompletionTokens?: number;
  jsonObject?: boolean;
};

export type ChatClient = {
  complete(messages: ChatMessage[], options?: ChatCompleteOptions): Promise<string>;
};

/** Official Groq OpenAI-compatible chat endpoint. Model id comes from env. */
export const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MAX_COMPLETION_TOKENS = 800;
const OSS_MAX_COMPLETION_TOKENS = 2048;
const RETRY_WAIT_MS = 1500;

type GroqChatResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      content?: string | null;
    };
  }>;
};

function isOssModel(model: string): boolean {
  return /gpt-oss/i.test(model);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createGroqChatClient(config: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
  url?: string;
}): ChatClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const url = config.url ?? GROQ_CHAT_COMPLETIONS_URL;

  return {
    async complete(messages: ChatMessage[], options: ChatCompleteOptions = {}): Promise<string> {
      const maxCompletionTokens =
        options.maxCompletionTokens ??
        (isOssModel(config.model) ? OSS_MAX_COMPLETION_TOKENS : DEFAULT_MAX_COMPLETION_TOKENS);

      const body: Record<string, unknown> = {
        model: config.model,
        messages,
        temperature: 0.2,
        max_completion_tokens: maxCompletionTokens,
      };
      if (isOssModel(config.model)) {
        body.reasoning_effort = "low";
      }
      if (options.jsonObject === true) {
        body.response_format = { type: "json_object" };
      }

      let lastUnavailable: HttpError | undefined;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        let response: Response;
        try {
          response = await fetchImpl(url, {
            method: "POST",
            headers: {
              authorization: `Bearer ${config.apiKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify(body),
          });
        } catch {
          throw new HttpError(503, "AI_UNAVAILABLE", "The explanation service is unavailable.");
        }

        if (!response.ok) {
          lastUnavailable = new HttpError(503, "AI_UNAVAILABLE", "The explanation service is unavailable.");
          if ((response.status === 429 || response.status === 503) && attempt === 0) {
            await wait(RETRY_WAIT_MS);
            continue;
          }
          throw lastUnavailable;
        }

        const payload = (await response.json()) as GroqChatResponse;
        const content = payload.choices?.[0]?.message?.content;
        if (typeof content !== "string" || content.trim() === "") {
          throw new HttpError(502, "AI_ERROR", "The explanation service returned an empty reply.");
        }
        return content.trim();
      }

      throw lastUnavailable ?? new HttpError(503, "AI_UNAVAILABLE", "The explanation service is unavailable.");
    },
  };
}

/** Groq vision model when GROQ_VISION_MODEL is unset. Llama 4 Scout shut down for developer tiers on 2026-07-17. */
export const DEFAULT_GROQ_VISION_MODEL = "qwen/qwen3.8-27b";
const VISION_FALLBACK_MODELS = ["qwen/qwen3.6-27b", "meta-llama/llama-4-maverick-17b-128e-instruct"] as const;

export async function completeGroqVision(config: {
  apiKey: string;
  model: string;
  prompt: string;
  imageDataUrl: string;
  fetchImpl?: typeof fetch;
  url?: string;
}): Promise<string> {
  const models = [config.model, ...VISION_FALLBACK_MODELS.filter((item) => item !== config.model)];
  let lastError: HttpError | undefined;
  for (const model of models) {
    try {
      return await completeGroqVisionOnce({ ...config, model });
    } catch (error) {
      if (!(error instanceof HttpError)) {
        throw error;
      }
      lastError = error;
      if (error.code !== "AI_MODEL") {
        throw error;
      }
    }
  }
  throw lastError ?? new HttpError(503, "AI_UNAVAILABLE", "HULUM could not read the screenshot right now.");
}

async function completeGroqVisionOnce(config: {
  apiKey: string;
  model: string;
  prompt: string;
  imageDataUrl: string;
  fetchImpl?: typeof fetch;
  url?: string;
}): Promise<string> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const url = config.url ?? GROQ_CHAT_COMPLETIONS_URL;
  const body = {
    model: config.model,
    temperature: 0.1,
    max_completion_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: config.prompt },
          { type: "image_url", image_url: { url: config.imageDataUrl } },
        ],
      },
    ],
  };

  let lastUnavailable: HttpError | undefined;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new HttpError(503, "AI_UNAVAILABLE", "HULUM could not reach Groq to read the screenshot.");
    }
    if (!response.ok) {
      const detail = await groqErrorDetail(response);
      console.error(redactSecrets(`screenshot vision ${config.model} HTTP ${String(response.status)} ${detail}`));
      if (response.status === 413) {
        throw new HttpError(413, "PAYLOAD_TOO_LARGE", "That screenshot is too large. Try a smaller photo.");
      }
      if (response.status === 400 || response.status === 404) {
        throw new HttpError(503, "AI_MODEL", "HULUM could not use this screenshot model.");
      }
      lastUnavailable = new HttpError(503, "AI_UNAVAILABLE", "HULUM could not read the screenshot right now.");
      if ((response.status === 429 || response.status === 503) && attempt === 0) {
        await wait(RETRY_WAIT_MS);
        continue;
      }
      throw lastUnavailable;
    }
    const payload = (await response.json()) as GroqChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim() === "") {
      throw new HttpError(502, "AI_ERROR", "The screenshot reader returned an empty reply.");
    }
    return content.trim();
  }
  throw lastUnavailable ?? new HttpError(503, "AI_UNAVAILABLE", "HULUM could not read the screenshot right now.");
}

async function groqErrorDetail(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: { message?: unknown; code?: unknown } };
    const message = typeof payload.error?.message === "string" ? payload.error.message : "";
    const code = typeof payload.error?.code === "string" ? payload.error.code : "";
    return `${code} ${message}`.trim();
  } catch {
    return "";
  }
}
