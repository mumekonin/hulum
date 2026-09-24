import type { LanguageCode } from "@hulum/shared";

/** Ask HULUM chrome copy. Amharic is text UX only — not a live STT claim (ADR 004). */
export type AssistantCopy = {
  title: string;
  intro: string;
  languageLegend: string;
  languageHint: string;
  quickLegend: string;
  typePlaceholder: string;
  send: string;
  micMissingTitle: string;
  micMissingBody: string;
  voxideReadyTitle: string;
  voxideReadyBody: string;
  voiceIssueTitle: string;
  typeRequest: string;
  browseOpportunities: string;
  showInternships: string;
};

const EN: AssistantCopy = {
  title: "Ask HULUM",
  intro:
    "Voice must perform real product actions. Text and quick actions always work. The Voxide widget, when keyed, calls the same actions — it never invents APPLY / MAYBE / SKIP.",
  languageLegend: "Language",
  languageHint:
    "English is the stable v0.1 path. Amharic text intents and explanations use this selector; live Amharic STT is not claimed.",
  quickLegend: "Quick actions",
  typePlaceholder: "Ask HULUM…",
  send: "Send",
  micMissingTitle: "Microphone unavailable",
  micMissingBody: "Type or use a quick action. Voxide key missing or invalid (`NEXT_PUBLIC_VOXIDE_KEY`).",
  voxideReadyTitle: "Voxide widget ready",
  voxideReadyBody:
    "Use the Ask HULUM launcher (bottom-right) for voice or widget text. Tools call the same product actions as the quick buttons. APPLY / MAYBE / SKIP still come from decide() on the server. If the mic fails or goes silent, type or use a quick action.",
  voiceIssueTitle: "Voice issue",
  typeRequest: "Type a request",
  browseOpportunities: "Browse opportunities",
  showInternships: "Show internships",
};

const AM: AssistantCopy = {
  title: "ሁሉምን ጠይቅ",
  intro:
    "ድምጽ እውነተኛ የHULUM እርምጃዎችን ማከናወን አለበት። ጽሑፍ እና ፈጣን እርምጃዎች ሁልጊዜ ይሰራሉ። የVoxide መግብር ተመሳሳይ እርምጃዎችን ይጠራል — APPLY / MAYBE / SKIP አይፈጥርም።",
  languageLegend: "ቋንቋ",
  languageHint:
    "እንግሊዝኛ የተረጋጋው v0.1 መንገድ ነው። አማርኛ ጽሑፍ እና ማብራሪያ ይህን መምረጫ ይጠቀማሉ፤ የቀጥታ አማርኛ ድምጽ STT አይታወጅም።",
  quickLegend: "ፈጣን እርምጃዎች",
  typePlaceholder: "ሁሉምን ጠይቅ…",
  send: "ላክ",
  micMissingTitle: "ማይክሮፎን አይገኝም",
  micMissingBody: "ይጻፉ ወይም ፈጣን እርምጃ ይጠቀሙ። የVoxide ቁልፍ የለም ወይም ልክ አይደለም (`NEXT_PUBLIC_VOXIDE_KEY`)።",
  voxideReadyTitle: "የVoxide መግብር ዝግጁ ነው",
  voxideReadyBody:
    "ለድምጽ ወይም ለጽሑፍ የAsk HULUM ማስጀመሪያውን (ታች-ቀኝ) ይጠቀሙ። APPLY / MAYBE / SKIP ከአገልጋዩ decide() ብቻ ይመጣሉ። ማይክ ካልሰራ ይጻፉ።",
  voiceIssueTitle: "የድምጽ ችግር",
  typeRequest: "ጥያቄ ይጻፉ",
  browseOpportunities: "እድሎችን ይመልከቱ",
  showInternships: "ኢንተርንሺፖችን አሳይ",
};

const QUICK_EN = [
  "Show me internships",
  "Show me opportunities I should apply for",
  "Show me maybe opportunities",
  "Should I apply for this?",
  "Tell me about this opportunity",
  "Why did you say that?",
  "What am I missing?",
  "What should I prepare?",
  "What is missing from my profile?",
  "Clarify uncertain requirements",
  "Personalize my readiness plan",
  "Repeat that",
  "Extract profile from this: I study CS in Addis Ababa",
];

const QUICK_AM = [
  "ለዚህ እድል ማመልከት?",
  "ለምን?",
  "ምን ጎድሎኛል?",
  "ምን ላዘጋጅ?",
  "እድሎች",
  "Should I apply for this?",
  "Why did you say that?",
  "What am I missing?",
  "What should I prepare?",
  "Repeat that",
  "ድገም",
];

export function assistantCopy(language: LanguageCode): AssistantCopy {
  return language === "am" ? AM : EN;
}

export function assistantQuickActions(language: LanguageCode): string[] {
  return language === "am" ? QUICK_AM : QUICK_EN;
}
