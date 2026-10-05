import type { LanguageCode } from "@hulum/shared";

/** Publishable widget key only (`vox_pub_…`). Never a secret server key. */
export function readVoxidePublicKey(): string {
  const primary = process.env.NEXT_PUBLIC_VOXIDE_KEY?.trim() ?? "";
  const alias = process.env.NEXT_PUBLIC_VOXIDE_PUBLIC_KEY?.trim() ?? "";
  const key = primary !== "" ? primary : alias;
  return key.startsWith("vox_pub_") ? key : "";
}

export function hasVoxidePublicKey(): boolean {
  return readVoxidePublicKey() !== "";
}

/** Bottom padding for sticky bars so the floating Voxide launcher never covers their buttons. */
export function voiceLauncherClearance(): string {
  return hasVoxidePublicKey()
    ? "pb-24 lg:pb-[max(1rem,env(safe-area-inset-bottom))]"
    : "pb-[max(1rem,env(safe-area-inset-bottom))]";
}

/**
 * Widget STT locale hint. Public Voxide docs do not list verified Amharic/Oromo recognition.
 * Use English STT for Oromo UI selection — do not invent an om-ET mic claim (ADR 004).
 * Replies still follow the asked language on POST /api/voice/action when the model supports it.
 */
export function voxideSpeechLocale(language: LanguageCode): "en-US" | "am-ET" {
  if (language === "am") {
    return "am-ET";
  }
  return "en-US";
}

/** Gemini refused or apologized instead of speaking the HULUM tool result. */
export function isVoxideRefusal(text: string): boolean {
  return /i('d| would) love to|still don'?t have|don'?t have (the )?(right |necessary )?tools?|do not have (the )?(right |necessary )?tools?|no (ability|tool|capability)|cannot (help|do that|show|list|analyze|display)|i can'?t (analyze|show|display|list)|i('m| am) (not |un)able|lack(s)? (the )?(right |necessary )?(tools?|ability)|i have no ability|i('m| am) sorry|sorry[,.]? i|here to help with your next/i.test(
    text,
  );
}

/** Spoken or pasted HULUM result — never treat as a new user question. */
export function isSpokenHulumResult(text: string): boolean {
  const value = text.trim();
  if (value.length > 160) {
    return true;
  }
  return /^(scholarships|internships|fellowships|grants|jobs|competitions|here are current opportunities|apply for |maybe for |skip for |speak only this hulum|missing or uncertain:|official source:)/i.test(
    value,
  ) || /fit \d+%|always verify final eligibility|confirm eligibility there/i.test(value);
}

export function isEchoOfReply(text: string, reply: string): boolean {
  const spoken = text.trim();
  const stored = reply.trim();
  if (spoken.length < 8 || stored.length < 8) {
    return false;
  }
  return stored.startsWith(spoken) || spoken.startsWith(stored.slice(0, 48)) || stored.includes(spoken);
}

/** Internal prompt we must never treat as a visitor question. */
export function isHulumSpeakPrompt(text: string): boolean {
  return /^speak only this hulum answer/i.test(text.trim());
}

/** True only for a short user command, not a list/result/apology echo. */
export function isHulumProductRequest(text: string): boolean {
  const value = text.trim();
  if (value.length < 4 || value.length > 160) {
    return false;
  }
  if (isSpokenHulumResult(value) || isVoxideRefusal(value) || isHulumSpeakPrompt(value)) {
    return false;
  }
  return /\b(show|list|find|filter|open|analyze|analysis|anlysis|tell me|why |what (am|should)|prepare|extract|update profile|should i apply|scholarships?|internships?|fellowships?)\b|agarsiisi|madaali|ibsi|carraa|[\u1200-\u137F]/i.test(
    value,
  );
}

export const VOXIDE_STARTERS = [
  "Show me scholarships",
  "Analyze for me",
  "Tell me the details",
  "Open my profile",
  "Open opportunities",
];
