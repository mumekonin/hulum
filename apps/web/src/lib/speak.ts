import { canSpeakLocale } from "./voxide";

/** Read a HULUM answer aloud with the browser's own voice. Returns false when it can't. */
export function speakAloud(text: string, locale: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || text.trim() === "") {
    return false;
  }
  const synth = window.speechSynthesis;
  if (!canSpeakLocale(locale, synth.getVoices())) {
    return false;
  }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  synth.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
