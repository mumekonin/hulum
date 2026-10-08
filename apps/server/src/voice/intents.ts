import {
  type Decision,
  type LanguageCode,
  type Opportunity,
  type OpportunityType,
  type Profile,
  type VoiceIntent,
} from "@hulum/shared";

export type ParsedIntent = {
  /** Locked Task 22 intents, plus runtime `UNSUPPORTED` when nothing matched. */
  intent: VoiceIntent | "UNSUPPORTED";
  type?: OpportunityType;
  decision?: Decision;
  /** Narrower handler hint without expanding the Task 22 lock set. */
  replyHint?: "profile_gaps" | "profile_summary" | "clarify_uncertain" | "profile_extract";
};

/** The visitor asked about themselves, not about the open listing. */
export function isProfileSelfQuestion(text: string): boolean {
  const value = text.trim();
  if (/this (opportunity|listing|scholarship|internship|job|fellowship)|about this\b/i.test(value)) {
    return false;
  }
  return /\b(about me|who am i|myself|my profile|based on (my|the) profile|describe me|what do you know about me)\b/i.test(
    value,
  );
}

const TYPE_WORDS: Array<[RegExp, OpportunityType]> = [
  [/\binternship|ኢንተርንሺፕ|internshipwwan|hojii barumsaa/i, "internship"],
  [/\bscholarship|ስኮላርሺፕ|ስኮለርሺፕ|scholarshipwwan|carraa barumsaa|barumsaa/i, "scholarship"],
  // fellowship — am: ፌሎሺፕ / fellowshipwwan (Oromo plural)
  [/\bfellowship|ፌሎሺፕ|fellowshipwwan|carraa qorannoo/i, "fellowship"],
  [/\bgrant|grantii/i, "grant"],
  [/\bjob|remote job|hojii/i, "job"],
  [/\bcompetition|dorgommii/i, "competition"],
];

function decisionFromUtterance(value: string): Decision | undefined {
  if (/\bmaybe\b/i.test(value)) return "MAYBE";
  if (/\bskip\b/i.test(value)) return "SKIP";
  if (/\bapply\b/i.test(value)) return "APPLY";
  return undefined;
}

/** True when the user asked to list and analyze in one utterance. */
export function wantsListWithAnalyze(text: string): boolean {
  return (
    /show|list|filter|አሳይ|አሳየኝ|agarsiisi|carraawwan|እድሎች/i.test(text) &&
    /analy[sz]|analysis|ትንተና|madaali|madaaluu|አወዳድር/i.test(text)
  );
}

export function parseVoiceIntent(text: string, _language: LanguageCode = "en"): ParsedIntent {
  const value = text.trim();

  if (/i can'?t analyze|cannot analyze|can not analyze|not able to analyze/i.test(value)) {
    return { intent: "UNSUPPORTED" };
  }
  if (/^(scholarships|internships|fellowships|apply for |maybe for |skip for )\b/i.test(value)) {
    return { intent: "UNSUPPORTED" };
  }

  if (/(show|list|filter)/i.test(value)) {
    const decision = decisionFromUtterance(value);
    if (decision) {
      return { intent: "FILTER_BY_DECISION", decision };
    }
  }
  if (
    /ለዚህ እድል ማመልከት|should i apply|analy[sz]e?|anlysis|analysis|fit score|what'?s (my |the )?fit|አወዳድር|ትንተና|madaali|madaaluu|apply gochuu|nan apply/i.test(
      value,
    )
  ) {
    const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));
    return {
      intent: "ANALYZE_OPPORTUNITY",
      ...(typeHit === undefined ? {} : { type: typeHit[1] }),
    };
  }
  if (/ለምን|why (apply|maybe|skip|did you)|explain|^why\b|maalif|maaliif|what do you think|your opinion|is this (good|worth)|do you recommend|how does this (fit|compare)/i.test(value)) {
    return { intent: "EXPLAIN_DECISION" };
  }
  // Profile gaps before generic "what am I missing" (opportunity requirements).
  if (
    /profile\s*(gap|gaps|incomplete|missing)|missing from my profile|what.*(incomplete|missing).*profile|profile.*(incomplete|missing)/i.test(
      value,
    )
  ) {
    return { intent: "UPDATE_PROFILE", replyHint: "profile_gaps" };
  }
  if (isProfileSelfQuestion(value)) {
    return { intent: "UPDATE_PROFILE", replyHint: "profile_summary" };
  }
  if (
    /clarif(y|ication)|which requirements.*(uncertain|unclear)|explain.*(uncertain|unclear).*requirement/i.test(
      value,
    )
  ) {
    return { intent: "SHOW_MISSING_REQUIREMENTS", replyHint: "clarify_uncertain" };
  }
  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing|maal dhabe|hanqina/i.test(value)) {
    return { intent: "SHOW_MISSING_REQUIREMENTS" };
  }
  if (/ምን ላዘጋጅ|what should i prepare|readiness|checklist|prepare|qopheessuu|qopheessi/i.test(value)) {
    return { intent: "SHOW_READINESS" };
  }
  if (
    /extract (my )?profile|build (my )?profile from|profile from (this|my) (text|description)|fill (my )?profile from|create (my )?profile from/i.test(
      value,
    )
  ) {
    return { intent: "UPDATE_PROFILE", replyHint: "profile_extract" };
  }
  if (/update profile|change profile|edit profile/i.test(value)) {
    return { intent: "UPDATE_PROFILE" };
  }

  const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));
  // Widen trigger: include singular type names (fellowship, scholarship, internship, grant, job,
  // competition) so "show me the fellowship" / "show me a scholarship" all route here.
  if (
    typeHit &&
    /show|list|find|filter|internships?|scholarships?|fellowships?|grants?|jobs?|competitions?|\u12a2\u1295\u1270\u122d\u1295\u123a\u1355|\u1235\u12ae\u120b\u122d\u123a\u1355|\u134c\u120e\u123a\u1355|agarsiisi|natti agarsiisi/i.test(value)
  ) {
    return { intent: "FILTER_OPPORTUNITIES", type: typeHit[1] };
  }
  if (/show|list|opportunities|እድሎች|carraawwan|carraa agarsiisi/i.test(value)) {
    return { intent: "SHOW_OPPORTUNITIES" };
  }
  if (
    /open|details|tell me about this|about this opportunity|current opportunity|ዝርዝር|ስለዚህ እድል|ንገረኝ|ibsi|natti himi|naaf himi|deadline|due date|documents?|requirements?|eligib|official (site|source|link)|where (do i|to) apply|funded|stipend/i.test(
      value,
    )
  ) {
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

function plain(value: string): string {
  return value.trim().replace(/_/g, " ");
}

/** Speak only facts saved on the profile. Never substitute the open listing. */
export function formatProfileSummary(profile: Profile, displayName?: string): string {
  const facts: string[] = [];
  const name = profile.name?.trim() || displayName?.trim();
  if (name) facts.push(`Name: ${name}`);
  if (profile.educationLevel) facts.push(`Education: ${plain(String(profile.educationLevel))}`);
  if (profile.fieldOfStudy?.trim()) facts.push(`Field of study: ${plain(profile.fieldOfStudy)}`);
  if (profile.graduationYear) facts.push(`Graduation year: ${profile.graduationYear}`);
  const place = [profile.city, profile.country].map((part) => part?.trim() ?? "").filter(Boolean).join(", ");
  if (place) facts.push(`Location: ${place}`);
  if (profile.languages.length > 0) facts.push(`Languages: ${profile.languages.join(", ")}`);
  if (profile.skills.length > 0) facts.push(`Skills: ${profile.skills.join(", ")}`);
  if (profile.experience?.trim()) facts.push(`Experience: ${plain(profile.experience)}`);
  if (typeof profile.yearsExperience === "number" && profile.yearsExperience > 0) {
    facts.push(`Years of experience: ${profile.yearsExperience}`);
  }
  if (profile.interests.length > 0) facts.push(`Interests: ${profile.interests.join(", ")}`);
  if (facts.length === 0) {
    return "Your profile does not have saved facts yet. Open Profile and add education, field, location, and skills. Voice cannot change those facts until you save them.";
  }
  return `Here is your saved profile, not a job listing. ${facts.join(". ")}. Ask to analyze an opportunity when you want APPLY, MAYBE, or SKIP.`;
}

export function formatProfileGaps(missing: string[]): string {
  if (missing.length === 0) {
    return "Your profile looks complete for v0.1 matching. You can still edit details on the profile page.";
  }
  const labels = missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field);
  return `Your profile is missing: ${labels.join(", ")}. Open your profile to add them before analyzing. Voice cannot silently change stored facts.`;
}

/** Strip the extract-request prefix so Groq sees the self-description only. */
export function stripProfileExtractDescription(text: string): string {
  return text
    .replace(
      /^.*?(?:extract (?:my )?profile(?: from this)?:?|build (?:my )?profile from|create (?:my )?profile from|profile from (?:this|my) (?:text|description):?|fill (?:my )?profile from)\s*/i,
      "",
    )
    .trim();
}
