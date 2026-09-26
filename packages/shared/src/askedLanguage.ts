import type { LanguageCode } from "./types.js";

const GE_EZ = /[\u1200-\u137F]/;

const OROMO_MARKERS =
  /\b(agarsiisi|maalif|maaliif|carraa|carraawwan|qopheessuu|qopheessi|natti|naaf|himi|ibsi|ibsa|barumsaa|madaali|madaaluu|hojii|hanqina|murtee|scholarshipwwan)\b/i;

const ENGLISH_MARKERS =
  /\b(show|list|filter|analyze|analyse|analysis|details?|tell me|why|missing|prepare|should i apply|opportunities|scholarships?|internships?)\b/i;

/** Detect the language of this utterance. Ge'ez → am, Oromo markers → om, clear English → en. */
export function detectAskedLanguage(text: string, fallback: LanguageCode = "en"): LanguageCode {
  const value = text.trim();
  if (value === "") {
    return fallback;
  }
  if (GE_EZ.test(value)) {
    return "am";
  }
  if (OROMO_MARKERS.test(value)) {
    return "om";
  }
  if (ENGLISH_MARKERS.test(value)) {
    return "en";
  }
  return fallback;
}
