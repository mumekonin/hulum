import { HttpError } from "../http/errors.js";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export type ChatClient = {
  complete(messages: ChatMessage[]): Promise<string>;
};

/** Official Groq OpenAI-compatible chat endpoint. Model id comes from env. */
export const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export function createGroqChatClient(config: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
  url?: string;
}): ChatClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const url = config.url ?? GROQ_CHAT_COMPLETIONS_URL;

  return {
    async complete(messages: ChatMessage[]): Promise<string> {
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: "POST",
          headers: {
            authorization: `Bearer ${config.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            temperature: 0.2,
            max_completion_tokens: 800,
          }),
        });
      } catch {
        throw new HttpError(503, "AI_UNAVAILABLE", "The explanation service is unavailable.");
      }

      if (!response.ok) {
        throw new HttpError(503, "AI_UNAVAILABLE", "The explanation service is unavailable.");
      }

      const payload = (await response.json()) as GroqChatResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.trim() === "") {
        throw new HttpError(502, "AI_ERROR", "The explanation service returned an empty reply.");
      }
      return content.trim();
    },
  };
}
