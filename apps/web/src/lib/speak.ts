import { canSpeakLocale } from "./voxide";

export type ListedVoice = { lang: string; default?: boolean };

/** One browser voice for a locale. The system default wins when several voices are installed. */
export function voiceForLocale<T extends ListedVoice>(locale: string, voices: readonly T[]): T | undefined {
  const base = locale.slice(0, 2).toLowerCase();
  const matching = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base));
  return matching.find((voice) => voice.default === true) ?? matching[0];
}

export function isBrowserSpeaking(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
}

/** Read a HULUM answer aloud with one browser voice. Returns false when it can't. */
export function speakAloud(text: string, locale: string, onDone?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || text.trim() === "") {
    return false;
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (!canSpeakLocale(locale, voices)) {
    return false;
  }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = 1;
  utterance.pitch = 1;
  const voice = voiceForLocale(locale, voices);
  if (voice !== undefined && "voiceURI" in voice) {
    utterance.voice = voice as SpeechSynthesisVoice;
  }
  utterance.onend = () => onDone?.();
  utterance.onerror = () => onDone?.();
  synth.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
