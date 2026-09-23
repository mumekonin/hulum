export const Decision = {
  APPLY: "APPLY",
  MAYBE: "MAYBE",
  SKIP: "SKIP",
} as const;

export type Decision = (typeof Decision)[keyof typeof Decision];

export const RequirementStatus = {
  MET: "MET",
  NOT_MET: "NOT_MET",
  UNCERTAIN: "UNCERTAIN",
  NOT_APPLICABLE: "NOT_APPLICABLE",
} as const;

export type RequirementStatus = (typeof RequirementStatus)[keyof typeof RequirementStatus];

export const RequirementKey = {
  COUNTRY: "country",
  EDUCATION: "education",
  FIELD: "field",
  LANGUAGE: "language",
  EXPERIENCE: "experience",
  DOCUMENTS: "documents",
  DEADLINE: "deadline",
  OTHER: "other",
} as const;

export type RequirementKey = (typeof RequirementKey)[keyof typeof RequirementKey];

export const ReadinessStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  NOT_REQUIRED: "NOT_REQUIRED",
} as const;

export type ReadinessStatus = (typeof ReadinessStatus)[keyof typeof ReadinessStatus];

export const VerificationStatus = {
  VERIFIED: "VERIFIED",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  EXPIRED: "EXPIRED",
  AI_EXTRACTED: "AI_EXTRACTED",
} as const;

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const OpportunityType = {
  SCHOLARSHIP: "scholarship",
  FELLOWSHIP: "fellowship",
  INTERNSHIP: "internship",
  JOB: "job",
  GRANT: "grant",
  COMPETITION: "competition",
} as const;

export type OpportunityType = (typeof OpportunityType)[keyof typeof OpportunityType];

export const Language = {
  AMHARIC: "am",
  ENGLISH: "en",
  AFAAN_OROMO: "om",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export const VoiceIntent = {
  SHOW_OPPORTUNITIES: "SHOW_OPPORTUNITIES",
  FILTER_OPPORTUNITIES: "FILTER_OPPORTUNITIES",
  FILTER_BY_DECISION: "FILTER_BY_DECISION",
  OPEN_OPPORTUNITY: "OPEN_OPPORTUNITY",
  ANALYZE_OPPORTUNITY: "ANALYZE_OPPORTUNITY",
  EXPLAIN_DECISION: "EXPLAIN_DECISION",
  SHOW_MISSING_REQUIREMENTS: "SHOW_MISSING_REQUIREMENTS",
  SHOW_READINESS: "SHOW_READINESS",
  UPDATE_PROFILE: "UPDATE_PROFILE",
} as const;

export type VoiceIntent = (typeof VoiceIntent)[keyof typeof VoiceIntent];

const voiceIntentValues: readonly VoiceIntent[] = Object.values(VoiceIntent);

export function isVoiceIntent(value: string): value is VoiceIntent {
  return voiceIntentValues.some((intent) => intent === value);
}

export function isDecision(value: string): value is Decision {
  return value === Decision.APPLY || value === Decision.MAYBE || value === Decision.SKIP;
}

export function isLanguage(value: string): value is Language {
  return Object.values(Language).some((language) => language === value);
}

export function isReadinessStatus(value: string): value is ReadinessStatus {
  return Object.values(ReadinessStatus).some((status) => status === value);
}
