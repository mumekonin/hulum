import type { LanguageCode } from "@hulum/shared";
import type { ChatClient } from "../ai/index.js";

const LABEL: Record<Exclude<LanguageCode, "en">, string> = {
  am: "Amharic using Ethiopic script",
  om: "Afaan Oromo using Latin script",
};

/**
 * Rewrite a stored English reply in the asked language. APPLY / MAYBE / SKIP, titles, URLs, and percents stay as-is.
 * If Groq is unset, the caller already used the localized template.
 */
export async function speakInAskedLanguage(
  chat: ChatClient | undefined,
  language: LanguageCode,
  reply: string,
): Promise<string> {
  if (language === "en" || chat === undefined || reply.trim() === "") {
    return reply;
  }
  try {
    const text = await chat.complete([
      {
        role: "system",
        content: `Rewrite this HULUM assistant reply in ${LABEL[language]}. Keep APPLY, MAYBE, SKIP, opportunity titles, organization names, URLs, and percentages unchanged. Do not add listings or change the decision. Output only the rewritten reply.`,
      },
      { role: "user", content: reply },
    ]);
    const rewritten = text.trim();
    return rewritten === "" ? reply : rewritten;
  } catch {
    return reply;
  }
}
