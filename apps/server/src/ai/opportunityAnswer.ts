import {
  Decision,
  OFFICIAL_SOURCE_NOTICE,
  type Analysis,
  type LanguageCode,
  type Opportunity,
} from "@hulum/shared";
import type { ChatClient } from "./groq.js";

function list(values: string | string[]): string {
  const items = (Array.isArray(values) ? values : [values]).map((item) => item.trim()).filter(Boolean);
  return items.join("; ");
}

function storedRequirements(opportunity: Opportunity): string {
  const groups: Array<[string, string | string[]]> = [
    ["Education", opportunity.educationRequirements],
    ["Field", opportunity.fieldRequirements],
    ["Experience", opportunity.experienceRequirements],
    ["Language", opportunity.languageRequirements],
    ["Documents", opportunity.documentRequirements],
    ["Other", opportunity.otherRequirements],
    ["Countries", opportunity.countryEligibility],
  ];
  return groups
    .map(([label, value]) => {
      const shown = list(value);
      return shown === "" ? "" : `${label}: ${shown}`;
    })
    .filter((line) => line !== "")
    .join(". ");
}

function analysisWhy(analysis: Analysis): string {
  const rows = (analysis.requirements ?? []).filter(
    (item) => item.status === "NOT_MET" || item.status === "UNCERTAIN" || item.status === "MET",
  );
  if (rows.length === 0) {
    return `${analysis.summary} Next: ${analysis.nextAction}`;
  }
  const parts = rows.slice(0, 6).map((item) => {
    const text = item.text.trim() || item.key;
    const reason = (item.reason ?? "").trim();
    return reason ? `${text} (${item.status}): ${reason}` : `${text} (${item.status})`;
  });
  return `${analysis.decision}. ${analysis.summary} Why: ${parts.join(" ")} Next: ${analysis.nextAction}`;
}

export function clarifyStoredAnalysis(analysis: Analysis): string {
  return analysisWhy(analysis);
}

export function fallbackOpportunityAnswer(opportunity: Opportunity, analysis?: Analysis): string {
  const description = opportunity.description.trim();
  const excerpt = description.length > 420 ? `${description.slice(0, 420).trim()}…` : description;
  const reqs = storedRequirements(opportunity);
  const apply = opportunity.applicationUrl ?? opportunity.sourceUrl;
  const about = [
    `${opportunity.title} — ${opportunity.organization}.`,
    `Type ${opportunity.type}. Deadline ${opportunity.deadline}.`,
    excerpt === "" ? "" : excerpt,
    reqs === "" ? "No structured requirements were stored for this listing." : `Stored requirements: ${reqs}.`,
    analysis ? analysisWhy(analysis) : "Analyze this listing against your profile for APPLY / MAYBE / SKIP.",
    `Official source: ${apply}. ${OFFICIAL_SOURCE_NOTICE}`,
  ]
    .filter((line) => line !== "")
    .join(" ");
  return about;
}

/** Field-level answers from stored rows only. Undefined when the question is not a clear listing fact. */
export function answerFromStoredFacts(
  question: string,
  opportunity: Opportunity,
  analysis?: Analysis,
): string | undefined {
  const apply = opportunity.applicationUrl ?? opportunity.sourceUrl;
  if (/deadline|due date|when .*(close|end|due|apply)|closing date/i.test(question)) {
    return `Stored deadline: ${opportunity.deadline}. Confirm it on the official source; HULUM is not the organization. Official source: ${apply}.`;
  }
  if (/\b(document|documents|cv|resume|transcript|passport)\b/i.test(question)) {
    const docs = list(opportunity.documentRequirements);
    return docs === ""
      ? `This listing does not store specific document requirements. Confirm on the official source: ${apply}.`
      : `Stored document requirements: ${docs}. Confirm on the official source: ${apply}.`;
  }
  if (/education|degree|bachelor|master|phd|diploma/i.test(question)) {
    const education = list(opportunity.educationRequirements);
    return education === ""
      ? `This listing does not store an education requirement. Confirm on the official source: ${apply}.`
      : `Stored education requirement: ${education}. Confirm on the official source: ${apply}.`;
  }
  if (/\b(field|major|study|computer science|course)\b/i.test(question)) {
    const field = list(opportunity.fieldRequirements);
    return field === ""
      ? `This listing does not store a field-of-study requirement. Confirm on the official source: ${apply}.`
      : `Stored field requirement: ${field}. Confirm on the official source: ${apply}.`;
  }
  if (/\b(eligib|country|countries|ethiopia|who can apply)\b/i.test(question)) {
    const countries = list(opportunity.countryEligibility);
    return countries === ""
      ? `Eligible countries are not listed in the stored record. Confirm on the official source: ${apply}.`
      : `Stored country eligibility: ${countries}. Confirm on the official source: ${apply}.`;
  }
  if (/official (site|source|link|url)|where (do i|to) apply|application (url|link)/i.test(question)) {
    return `Apply or confirm on the official source: ${apply}. HULUM does not submit applications.`;
  }
  if (/funded|stipend|salary|tuition|allowance/i.test(question)) {
    const blob = `${opportunity.description} ${list(opportunity.otherRequirements)}`.toLowerCase();
    if (!/fund|stipend|salary|tuition|allowance|fully funded/.test(blob)) {
      return `Funding, stipend, or pay is not listed in the stored record. Confirm on the official source: ${apply}.`;
    }
  }
  if (
    analysis &&
    /what do you think|your opinion|is this (good|worth)|do you recommend|how does this (fit|compare)|why .*(decision|result|apply|maybe|skip)/i.test(
      question,
    )
  ) {
    return `${analysisWhy(analysis)} ${OFFICIAL_SOURCE_NOTICE}`;
  }
  if (/requirement|eligibility|what (is|does) this|tell me about|about this|details|explain/i.test(question)) {
    return fallbackOpportunityAnswer(opportunity, analysis);
  }
  return undefined;
}

function allowedUrls(opportunity: Opportunity): string[] {
  return [opportunity.sourceUrl, opportunity.applicationUrl].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function urlIsStored(href: string, opportunity: Opportunity): boolean {
  const cleaned = href.replace(/[),.;]+$/g, "");
  return allowedUrls(opportunity).some((stored) => cleaned === stored || cleaned.startsWith(stored));
}

export function isUnsafeOpportunityAnswer(
  text: string,
  opportunity: Opportunity,
  analysis?: Analysis,
): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 24 || /^\s*[{[]/.test(trimmed)) {
    return true;
  }
  const urls = trimmed.match(/https?:\/\/[^\s)]+/gi) ?? [];
  if (urls.some((href) => !urlIsStored(href, opportunity))) {
    return true;
  }
  if (analysis) {
    const mentioned = new Set<string>();
    for (const match of trimmed.matchAll(/\b(apply|maybe|skip)\b/gi)) {
      const token = match[1]?.toUpperCase();
      if (token === Decision.APPLY || token === Decision.MAYBE || token === Decision.SKIP) {
        mentioned.add(token);
      }
    }
    if ([...mentioned].some((decision) => decision !== analysis.decision)) {
      return true;
    }
  }
  return false;
}

export function buildOpportunityAnswerMessages(
  question: string,
  language: LanguageCode,
  opportunity: Opportunity,
  analysis?: Analysis,
): Array<{ role: "system" | "user"; content: string }> {
  const facts = {
    title: opportunity.title,
    organization: opportunity.organization,
    type: opportunity.type,
    deadline: opportunity.deadline,
    description: opportunity.description,
    countryEligibility: opportunity.countryEligibility,
    educationRequirements: opportunity.educationRequirements,
    fieldRequirements: opportunity.fieldRequirements,
    experienceRequirements: opportunity.experienceRequirements,
    languageRequirements: opportunity.languageRequirements,
    documentRequirements: opportunity.documentRequirements,
    otherRequirements: opportunity.otherRequirements,
    applicationUrl: opportunity.applicationUrl,
    sourceUrl: opportunity.sourceUrl,
    ...(analysis === undefined
      ? {}
      : {
          decision: analysis.decision,
          summary: analysis.summary,
          nextAction: analysis.nextAction,
          requirements: (analysis.requirements ?? []).map((item) => ({
            text: item.text,
            status: item.status,
            reason: item.reason,
          })),
        }),
  };
  const languageLabel = language === "am" ? "Amharic" : language === "om" ? "Afaan Oromo" : "English";
  return [
    {
      role: "system",
      content:
        "You are HULUM. Answer only from the stored JSON. If a fact is missing, say it is not listed and point to the official sourceUrl. Never change APPLY, MAYBE, or SKIP. Never invent deadlines, amounts, or URLs. Do not give a personal opinion beyond the stored decision. Do not output JSON.",
    },
    {
      role: "user",
      content: `Answer this question in ${languageLabel} using only the JSON.\nQuestion: ${question}\n${JSON.stringify(facts)}`,
    },
  ];
}

export async function answerOpportunityQuestion(input: {
  question: string;
  language: LanguageCode;
  opportunity: Opportunity;
  analysis?: Analysis;
  chat?: ChatClient;
}): Promise<string> {
  const stored = answerFromStoredFacts(input.question, input.opportunity, input.analysis);
  const fallback = stored ?? fallbackOpportunityAnswer(input.opportunity, input.analysis);
  if (input.chat === undefined) {
    return fallback;
  }
  try {
    const raw = await input.chat.complete(
      buildOpportunityAnswerMessages(input.question, input.language, input.opportunity, input.analysis),
    );
    if (isUnsafeOpportunityAnswer(raw, input.opportunity, input.analysis)) {
      return fallback;
    }
    return raw.trim();
  } catch {
    return fallback;
  }
}
