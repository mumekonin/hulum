import {
  type Decision,
  type LanguageCode,
  type Opportunity,
  type OpportunityType,
  type VoiceIntent,
} from "@hulum/shared";

export type ParsedIntent = {
  /** Locked Task 22 intents, plus runtime `UNSUPPORTED` when nothing matched. */
  intent: VoiceIntent | "UNSUPPORTED";
  type?: OpportunityType;
  decision?: Decision;
  /** Narrower handler hint without expanding the Task 22 lock set. */
  replyHint?: "profile_gaps" | "clarify_uncertain" | "personalized_plan" | "repeat";
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
  if (/repeat|say (that|it) again|again please|ድገም/i.test(value)) {
    return { intent: "UNSUPPORTED", replyHint: "repeat" };
  }
  // Profile gaps before generic "what am I missing" (opportunity requirements).
  if (
    /profile\s*(gap|gaps|incomplete|missing)|missing from my profile|what.*(incomplete|missing).*profile|profile.*(incomplete|missing)/i.test(
      value,
    )
  ) {
    return { intent: "UPDATE_PROFILE", replyHint: "profile_gaps" };
  }
  if (
    /clarif(y|ication)|which requirements.*(uncertain|unclear)|explain.*(uncertain|unclear).*requirement/i.test(
      value,
    )
  ) {
    return { intent: "SHOW_MISSING_REQUIREMENTS", replyHint: "clarify_uncertain" };
  }
  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing/i.test(value)) {
    return { intent: "SHOW_MISSING_REQUIREMENTS" };
  }
  if (/personalized readiness|personalize.*(plan|readiness|checklist)|readiness plan/i.test(value)) {
    return { intent: "SHOW_READINESS", replyHint: "personalized_plan" };
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

const PROFILE_FIELD_LABELS: Record<string, string> = {
  educationLevel: "education level",
  fieldOfStudy: "field of study",
  graduationYear: "graduation year",
  country: "country",
  city: "city",
  languages: "languages",
  skills: "skills",
  experience: "experience",
  interests: "interests",
};

export function formatProfileGaps(missing: string[]): string {
  if (missing.length === 0) {
    return "Your profile looks complete for v0.1 matching. You can still edit details on the profile page.";
  }
  const labels = missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field);
  return `Your profile is missing: ${labels.join(", ")}. Open your profile to add them before analyzing. Voice cannot silently change stored facts.`;
}
