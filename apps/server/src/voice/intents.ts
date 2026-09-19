import {
  type LanguageCode,
  type Opportunity,
  type OpportunityType,
  type VoiceIntent,
} from "@hulum/shared";

export type ParsedIntent = {
  intent: VoiceIntent;
  type?: OpportunityType;
  replyHint?: string;
};

const TYPE_WORDS: Array<[RegExp, OpportunityType]> = [
  [/\binternship/i, "internship"],
  [/\bscholarship/i, "scholarship"],
  [/\bfellowship/i, "fellowship"],
  [/\bgrant/i, "grant"],
  [/\bjob|remote job/i, "job"],
  [/\bcompetition/i, "competition"],
];

export function parseVoiceIntent(text: string, _language: LanguageCode = "en"): ParsedIntent {
  const value = text.trim();

  if (/ለዚህ እድል ማመልከት|should i apply|analyze|analyse|fit\b/i.test(value)) {
    return { intent: "ANALYZE_OPPORTUNITY" };
  }
  if (/ለምን|why (apply|maybe|skip|did you)|explain|^why\b/i.test(value)) {
    return { intent: "EXPLAIN_DECISION" };
  }
  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing/i.test(value)) {
    return { intent: "SHOW_GAPS" };
  }
  if (/ምን ላዘጋጅ|what should i prepare|readiness|checklist|prepare/i.test(value)) {
    return { intent: "SHOW_READINESS" };
  }
  if (/update profile|change profile|edit profile/i.test(value)) {
    return { intent: "UPDATE_PROFILE" };
  }
  if (/show me maybe|filter by decision|APPLY|MAYBE|SKIP/i.test(value) && /show|filter/i.test(value)) {
    return { intent: "FILTER_BY_DECISION" };
  }

  const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));
  if (typeHit && /show|list|find|filter|internships|scholarships/i.test(value)) {
    return { intent: "FILTER_OPPORTUNITIES", type: typeHit[1] };
  }
  if (/show|list|opportunities|እድሎች/i.test(value)) {
    return { intent: "SHOW_OPPORTUNITIES" };
  }
  if (/open|details/i.test(value)) {
    return { intent: "OPEN_OPPORTUNITY" };
  }

  return { intent: "UNSUPPORTED" };
}

export function formatOpportunityList(opportunities: Opportunity[]): string {
  if (opportunities.length === 0) return "I could not find matching opportunities.";
  return opportunities
    .slice(0, 5)
    .map((item) => `${item.title} — ${item.organization}`)
    .join("; ");
}
