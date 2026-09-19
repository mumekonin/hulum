import type { LanguageCode } from "@hulum/shared";

export const LANGUAGE_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
  { code: "om", label: "Afaan Oromo" },
];

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return value === "en" || value === "am" || value === "om";
}
