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

export type VoxideTurn = { role: "user" | "ai"; text: string; partial?: boolean };

/** Latest visitor line, including a sentence the recognizer is still hearing. */
export function latestUserUtterance(messages: readonly VoxideTurn[]): {
  text: string;
  streaming: boolean;
} {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const row = messages[index];
    if (row?.role !== "user") {
      continue;
    }
    return { text: row.text.trim(), streaming: row.partial === true };
  }
  return { text: "", streaming: false };
}

/**
 * The latest thing the visitor said once recognition has closed the sentence.
 * A still-streaming line stays unfinished even if the live agent has already started talking.
 */
export function finishedUserUtterance(messages: readonly VoxideTurn[]): string {
  const heard = latestUserUtterance(messages);
  if (heard.text === "" || heard.streaming) {
    return "";
  }
  return heard.text;
}

/**
 * Transcript shown for a HULUM answer.
 * Drops the live agent's own lines after the latest question so filler is not left on screen.
 * Earlier HULUM answers stay. Pass `answer` to append the reply that should be read aloud.
 */
export function hulumTranscript(messages: readonly VoxideTurn[], answer?: string): VoxideTurn[] {
  let lastUser = -1;
  for (let index = 0; index < messages.length; index += 1) {
    const row = messages[index];
    if (row?.role === "user" && !isHulumSpeakPrompt(row.text)) {
      lastUser = index;
    }
  }
  const kept = messages.filter((row, index) => {
    if (row.role === "user" && isHulumSpeakPrompt(row.text)) {
      return false;
    }
    if (row.role !== "ai") {
      return true;
    }
    if (isVoxideRefusal(row.text)) {
      return false;
    }
    return index < lastUser;
  });
  const text = answer?.trim() ?? "";
  if (text === "") {
    return kept;
  }
  const last = kept[kept.length - 1];
  if (last?.role === "ai" && last.text === text) {
    return kept;
  }
  return [...kept, { role: "ai", text }];
}

/** English always has a system voice; other locales only when the browser lists one. */
export function canSpeakLocale(locale: string, voices: ReadonlyArray<{ lang: string }>): boolean {
  const base = locale.slice(0, 2).toLowerCase();
  if (base === "en") {
    return true;
  }
  return voices.some((voice) => voice.lang.toLowerCase().startsWith(base));
}

/**
 * Voxide's WebSocket `onerror` is a browser Event. Logging it prints `{}`.
 * That is not a spoken-recognition failure; skip treating it as one.
 */
export function isEmptyVoxideWsError(payload: unknown): boolean {
  if (payload === undefined || payload === null) {
    return true;
  }
  if (typeof payload === "string") {
    return payload.trim() === "";
  }
  if (typeof payload !== "object") {
    return false;
  }
  if ("message" in payload) {
    const message = (payload as { message: unknown }).message;
    return typeof message !== "string" || message.trim() === "";
  }
  return true;
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

function normalizedSpeech(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u1200-\u137f\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The microphone heard HULUM's own answer, or a fragment of it. */
export function isEchoOfReply(text: string, reply: string): boolean {
  const spoken = normalizedSpeech(text);
  const stored = normalizedSpeech(reply);
  if (spoken.length < 8 || stored.length < 8) {
    return false;
  }
  if (stored.includes(spoken) || spoken.includes(stored)) {
    return true;
  }
  const words = spoken.split(" ").filter((word) => word.length > 3);
  if (words.length < 2) {
    return false;
  }
  const hits = words.filter((word) => stored.includes(word)).length;
  return hits >= 2 && hits / words.length >= 0.6;
}

/** A request to stop talking. Not a question. */
export function isStopCommand(text: string): boolean {
  const value = normalizedSpeech(text);
  return /^(stop|stop talking|stop speaking|quiet|be quiet|shut up|cancel|enough|that is enough|thats enough)$/.test(
    value,
  );
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

/**
 * A real HULUM request worth answering aloud.
 * Background noise, echoes of the last answer, and "stop" are not requests.
 */
export function isAnswerableUtterance(text: string): boolean {
  if (isStopCommand(text)) {
    return false;
  }
  return isHulumProductRequest(text);
}

export const VOXIDE_STARTERS = [
  "Show me scholarships",
  "Analyze for me",
  "Tell me the details",
  "Open my profile",
  "Open opportunities",
];
