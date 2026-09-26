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
  return /no (ability|tool|capability)|don'?t have (the )?(necessary )?(tools?|ability|capabilities)|cannot (help|do that|show|list)|i('m| am) (not |un)able|lack(s)? (the )?(necessary )?(tools?|ability)|i have no ability|i('m| am) sorry|sorry[,.]? i/i.test(
    text,
  );
}

export function isHulumProductRequest(text: string): boolean {
  return /show|list|find|filter|scholarship|internship|fellowship|grant|job|competition|opportunit|analy|anlysis|detail|apply|missing|prepare|readiness|why|profile|journey|screenshot|research|agarsiisi|madaali|ibsi|carraa|[\u1200-\u137F]/i.test(
    text,
  );
}

export const VOXIDE_STARTERS = [
  "Show me scholarships",
  "Analyze for me",
  "Tell me the details",
  "Open my profile",
  "Open opportunities",
];
