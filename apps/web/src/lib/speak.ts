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

/**
 * Edge and Chrome drop an utterance that is spoken in the same turn as cancel(),
 * and they stay silent until speechSynthesis was used once from a click.
 * A later answer must still be audible.
 */
let speechGeneration = 0;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let resumeTimer: number | undefined;
let speechUnlocked = false;

function clearResume(): void {
  if (resumeTimer !== undefined) {
    window.clearInterval(resumeTimer);
    resumeTimer = undefined;
  }
}

/** Call from the mic click so a later answer is allowed to play. */
export function primeSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  const synth = window.speechSynthesis;
  synth.getVoices();
  synth.resume();
  if (speechUnlocked || synth.speaking) {
    return;
  }
  speechUnlocked = true;
  const primer = new SpeechSynthesisUtterance(" ");
  primer.volume = 0;
  primer.rate = 2;
  synth.speak(primer);
}

function startUtterance(
  text: string,
  locale: string,
  voices: readonly SpeechSynthesisVoice[],
  onDone?: () => void,
): void {
  const synth = window.speechSynthesis;
  const mine = ++speechGeneration;
  clearResume();
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = locale;
  utterance.rate = 1;
  utterance.pitch = 1;
  const voice = voiceForLocale(locale, voices);
  if (voice !== undefined && "voiceURI" in voice && voice.voiceURI !== "") {
    utterance.voice = voice;
  }
  activeUtterance = utterance;
  let finished = false;
  const finish = () => {
    if (finished || mine !== speechGeneration) {
      return;
    }
    finished = true;
    clearResume();
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    onDone?.();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  window.setTimeout(() => {
    if (mine !== speechGeneration) {
      return;
    }
    synth.resume();
    synth.speak(utterance);
    resumeTimer = window.setInterval(() => {
      if (mine !== speechGeneration || (!synth.speaking && !synth.pending)) {
        clearResume();
        return;
      }
      synth.resume();
    }, 1_000);
  }, 60);
}

/** Read a HULUM answer aloud with one browser voice. Returns false when it can't. */
export function speakAloud(text: string, locale: string, onDone?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || text.trim() === "") {
    return false;
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (voices.length === 0 && !locale.toLowerCase().startsWith("en")) {
    let settled = false;
    const tryLater = () => {
      if (settled) {
        return;
      }
      const ready = synth.getVoices();
      if (ready.length === 0) {
        return;
      }
      settled = true;
      synth.removeEventListener("voiceschanged", tryLater);
      if (!canSpeakLocale(locale, ready)) {
        onDone?.();
        return;
      }
      startUtterance(text, locale, ready, onDone);
    };
    synth.addEventListener("voiceschanged", tryLater);
    window.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      synth.removeEventListener("voiceschanged", tryLater);
      const ready = synth.getVoices();
      if (!canSpeakLocale(locale, ready)) {
        onDone?.();
        return;
      }
      startUtterance(text, locale, ready, onDone);
    }, 400);
    return true;
  }
  if (!canSpeakLocale(locale, voices)) {
    return false;
  }
  startUtterance(text, locale, voices, onDone);
  return true;
}

export function stopSpeaking(): void {
  speechGeneration += 1;
  clearResume();
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
