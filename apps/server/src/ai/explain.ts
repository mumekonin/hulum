import type { AnalysisContract, Decision, Profile } from "@hulum/shared";

function claudeKey(): string | undefined {
  return process.env.CLAUDE_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim() || undefined;
}

function claudeModel(): string | undefined {
  return process.env.CLAUDE_MODEL?.trim() || process.env.ANTHROPIC_MODEL?.trim() || undefined;
}

/** Drop Claude wording that contradicts the engine decision. */
export function sanitizeExplanation(text: string, decision: Decision, fallback: string): string {
  const cleaned = text.trim();
  if (!cleaned) return fallback;
  const mentioned = (["APPLY", "MAYBE", "SKIP"] as const).filter((item) => new RegExp(`\\b${item}\\b`).test(cleaned));
  if (mentioned.some((item) => item !== decision)) return fallback;
  return cleaned;
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
            content: `Explain this HULUM decision in plain language for ${profile.name}. Do not change the decision. Do not invent eligibility facts or deadlines. The deterministic engine already decided ${contract.decision}. Fit=${contract.fitScore}. Summary=${contract.summary}. Requirements=${JSON.stringify(contract.requirements)}`,
          },
        ],
      }),
    });

    if (!response.ok) return fallback;
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    return sanitizeExplanation(payload.content?.[0]?.text ?? "", contract.decision, fallback);
  } catch {
    return fallback;
  }
}
