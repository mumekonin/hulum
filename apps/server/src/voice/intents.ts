import {
  type Decision,
  type LanguageCode,
  type Opportunity,
  type OpportunityType,
  type VoiceIntent,
} from "@hulum/shared";

export type ParsedIntent = {
  intent: VoiceIntent;
  type?: OpportunityType;
  decision?: Decision;
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

function decisionFromUtterance(value: string): Decision | undefined {
  if (/\bmaybe\b/i.test(value)) return "MAYBE";
  if (/\bskip\b/i.test(value)) return "SKIP";
  if (/\bapply\b/i.test(value)) return "APPLY";
  return undefined;
}

export function parseVoiceIntent(text: string, _language: LanguageCode = "en"): ParsedIntent {
  const value = text.trim();

  if (/(show|list|filter)/i.test(value)) {
    const decision = decisionFromUtterance(value);
    if (decision) {
      return { intent: "FILTER_BY_DECISION", decision };
    }
  }
  if (/ለዚህ እድል ማመልከት|should i apply|analyze|analyse|fit\b/i.test(value)) {
    return { intent: "ANALYZE_OPPORTUNITY" };
  }
  if (/ለምን|why (apply|maybe|skip|did you)|explain|^why\b/i.test(value)) {
    return { intent: "EXPLAIN_DECISION" };
  }
  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing/i.test(value)) {
    return { intent: "SHOW_MISSING_REQUIREMENTS" };
  }
  if (/ምን ላዘጋጅ|what should i prepare|readiness|checklist|prepare/i.test(value)) {
    return { intent: "SHOW_READINESS" };
  }
  if (/update profile|change profile|edit profile/i.test(value)) {
    return { intent: "UPDATE_PROFILE" };
  }

  const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));
  if (typeHit && /show|list|find|filter|internships|scholarships/i.test(value)) {
    return { intent: "FILTER_OPPORTUNITIES", type: typeHit[1] };
  }
  if (/show|list|opportunities|እድሎች/i.test(value)) {
    return { intent: "SHOW_OPPORTUNITIES" };
  }
  if (/open|details|tell me about this|about this opportunity|current opportunity/i.test(value)) {
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

export function formatOpportunityContext(item: Opportunity, decision?: string): string {
  const stored = decision ? ` Stored HULUM decision: ${decision}.` : "";
  return `${item.title} — ${item.organization}. Type ${item.type}. Deadline ${item.deadline}. Official source: ${item.sourceUrl}.${stored} Confirm details on the official page.`;
}
