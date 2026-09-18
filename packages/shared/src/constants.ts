export const LANGUAGES = ["en", "am", "om"] as const;

export const EDUCATION_LEVELS = [
  "high_school",
  "diploma",
  "bachelor_in_progress",
  "bachelor",
  "master_in_progress",
  "master",
  "phd",
] as const;

export const EDUCATION_RANK: Record<(typeof EDUCATION_LEVELS)[number], number> = {
  high_school: 0,
  diploma: 1,
  bachelor_in_progress: 2,
  bachelor: 3,
  master_in_progress: 4,
  master: 5,
  phd: 6,
};

export const OPPORTUNITY_TYPES = [
  "scholarship",
  "fellowship",
  "internship",
  "job",
  "grant",
  "competition",
] as const;

export const DECISIONS = ["APPLY", "MAYBE", "SKIP"] as const;
export const REQUIREMENT_STATUSES = ["MET", "NOT_MET", "UNCERTAIN", "NOT_APPLICABLE"] as const;
export const VERIFICATION_STATUSES = ["VERIFIED", "NEEDS_REVIEW", "EXPIRED"] as const;
export const READINESS_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"] as const;
export const READINESS_PRIORITIES = ["high", "medium", "low"] as const;

export const VOICE_INTENTS = [
  "SHOW_OPPORTUNITIES",
  "FILTER_OPPORTUNITIES",
  "OPEN_OPPORTUNITY",
  "ANALYZE_OPPORTUNITY",
  "EXPLAIN_DECISION",
  "SHOW_GAPS",
  "SHOW_READINESS",
  "FILTER_BY_DECISION",
  "UPDATE_PROFILE",
  "UNSUPPORTED",
] as const;

export const AFRICAN_COUNTRIES = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo",
  "Cote d'Ivoire",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
] as const;

export const FIT_WEIGHTS = {
  country: 20,
  education: 20,
  field: 15,
  experience: 15,
  language: 10,
  deadline: 10,
  documents: 5,
  other: 5,
} as const;

export type FitCategory = keyof typeof FIT_WEIGHTS;

export const APPLY_MIN_SCORE = 75;

export const DISCLAIMER =
  "HULUM's analysis is based on the information available from the opportunity source and your profile. Always verify final eligibility and deadlines with the official organization.";

export const EDUCATION_LABELS: Record<(typeof EDUCATION_LEVELS)[number], string> = {
  high_school: "High school",
  diploma: "Diploma",
  bachelor_in_progress: "Bachelor's (in progress)",
  bachelor: "Bachelor's (completed)",
  master_in_progress: "Master's (in progress)",
  master: "Master's (completed)",
  phd: "PhD",
};

export const TYPE_LABELS: Record<(typeof OPPORTUNITY_TYPES)[number], string> = {
  scholarship: "Scholarship",
  fellowship: "Fellowship",
  internship: "Internship",
  job: "Job",
  grant: "Grant",
  competition: "Competition",
};
