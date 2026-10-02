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
 * Widget STT locale hint. Public Voxide docs do not list Amharic/Oromo recognition.
 * Replies still follow the asked language on POST /api/voice/action.
 */
export function voxideSpeechLocale(language: LanguageCode): "en-US" | "am-ET" | "om-ET" {
  if (language === "am") {
    return "am-ET";
  }
  if (language === "om") {
    return "om-ET";
  }
  return "en-US";
}

/** Gemini refused or apologized instead of speaking the HULUM tool result. */
export function isVoxideRefusal(text: string): boolean {
  return /no (ability|tool|capability)|don'?t have (the )?(necessary )?(tools?|ability|capabilities)|do not have (the )?(necessary )?(tools?|ability)|cannot (help|do that|show|list|analyze)|i can'?t analyze|i('m| am) (not |un)able|lack(s)? (the )?(necessary )?(tools?|ability)|i have no ability|i('m| am) sorry|sorry[,.]? i|here to help with your next/i.test(
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

/** Ask Gemini Live to read the stored HULUM result and nothing else. */
export function voxideSpeakOnly(reply: string): string {
  return `Speak only this HULUM answer. Do not apologize. Do not say you lack ability. Say only: ${reply}`;
}

/** True only for a short user command, not a list/result/apology echo. */
export function isHulumProductRequest(text: string): boolean {
  const value = text.trim();
  if (value.length < 4 || value.length > 160) {
    return false;
  }
  if (isSpokenHulumResult(value) || isVoxideRefusal(value)) {
    return false;
  }
  return /\b(show|list|find|filter|open|analyze|analysis|anlysis|tell me|why |what (am|should)|prepare|extract|update profile|should i apply)\b|agarsiisi|madaali|ibsi|carraa|[\u1200-\u137F]/i.test(
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
