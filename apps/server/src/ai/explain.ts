import type { AnalysisContract, Profile } from "@hulum/shared";

export async function explainDecision(profile: Profile, contract: AnalysisContract): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return contract.summary;
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
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `Explain this HULUM decision in plain language for ${profile.name}. Do not change the decision. Do not invent eligibility facts. Decision=${contract.decision}, fit=${contract.fitScore}. Summary=${contract.summary}. Requirements=${JSON.stringify(contract.requirements)}`,
          },
        ],
      }),
    });

    if (!response.ok) return contract.summary;
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = payload.content?.[0]?.text?.trim();
    return text || contract.summary;
  } catch {
    return contract.summary;
  }
}
