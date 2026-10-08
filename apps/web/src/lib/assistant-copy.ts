import type { LanguageCode } from "@hulum/shared";

/** Ask HULUM chrome copy. Replies follow the asked language. Live Amharic/Oromo STT is not claimed (ADR 004). */
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
    "Ask in English, Amharic, or Afaan Oromo. Replies follow the language of this request. Live Amharic/Oromo speech recognition is not claimed.",
  quickLegend: "Quick actions",
  typePlaceholder: "Ask HULUM…",
  send: "Send",
  micMissingTitle: "Microphone unavailable",
  micMissingBody:
    "Type your question, or use a quick action.",
  voxideReadyTitle: "Voxide widget ready",
  voxideReadyBody:
    "The Ask HULUM launcher stays on every page after login. Say show me scholarships, then analyze for me. APPLY / MAYBE / SKIP still come from decide(). If the mic fails, type or use a quick action.",
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
  micMissingBody:
    "ይጻፉ ወይም ፈጣን እርምጃ ይጠቀሙ።",
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

/** Oromo intent keywords already on the server (ADR 004). Chrome shell stays English. */
const QUICK_OM = [
  "Carraa kana madaali?",
  "Maalif?",
  "Maal dhabe?",
  "Qopheessi?",
  "Carraawwan agarsiisi",
  "Internshipwwan natti agarsiisi",
  "Carraa kana ibsi",
  "Should I apply for this?",
  "Why did you say that?",
  "What am I missing?",
  "What should I prepare?",
  "Repeat that",
];

/** Afaan Oromo: text quick actions + explain language. Ask HULUM chrome stays English (ADR 004). */
const OM: AssistantCopy = {
  ...EN,
  languageHint:
    "Afaan Oromo quick actions and typed requests use the same intent keywords as the server (madaali, maalif, hanqina, qopheessi). Ask HULUM chrome stays English for v0.1 — no full Oromo UI shell (ADR 004). Live Oromo STT is not claimed.",
};

export function assistantCopy(language: LanguageCode): AssistantCopy {
  if (language === "am") return AM;
  if (language === "om") return OM;
  return EN;
}

export function assistantQuickActions(language: LanguageCode): string[] {
  if (language === "am") return QUICK_AM;
  if (language === "om") return QUICK_OM;
  return QUICK_EN;
}
