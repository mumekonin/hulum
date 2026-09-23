import { HttpError } from "../http/errors.js";

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
