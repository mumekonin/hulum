import type { AnalysisContract, Profile } from "@hulum/shared";
import { validateClaudeOutput } from "./validate.js";

export { sanitizeExplanation, validateClaudeOutput } from "./validate.js";

function claudeKey(): string | undefined {
  return process.env.CLAUDE_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim() || undefined;
}

function claudeModel(): string | undefined {
  return process.env.CLAUDE_MODEL?.trim() || process.env.ANTHROPIC_MODEL?.trim() || undefined;
}

export async function explainDecision(profile: Profile, contract: AnalysisContract): Promise<string> {
  const fallback = contract.summary;
  const apiKey = claudeKey();
  const model = claudeModel();
  if (!apiKey || !model) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Explain this HULUM decision in plain language for ${profile.name}. Reply with JSON only: {"decision":"${contract.decision}","explanation":"..."}. decision must equal ${contract.decision}. Do not invent eligibility facts or deadlines. Do not treat UNCERTAIN requirements as MET. Do not claim official eligibility.`,
          },
        ],
      }),
    });

    if (!response.ok) return fallback;
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    return validateClaudeOutput(payload.content?.[0]?.text ?? "", contract);
  } catch {
    return fallback;
  }
}
