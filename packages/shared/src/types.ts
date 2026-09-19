import type {
  Decision,
  Language,
  OpportunityType,
  ReadinessStatus,
  RequirementKey,
  RequirementStatus,
  VerificationStatus,
  VoiceIntent,
} from "./enums.js";

export type Profile = {
  id: string;
  userId: string;
  educationLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  country: string | null;
  city: string | null;
  languages: string[];
  skills: string[];
  experience: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  deadline: string;
  countryEligibility: string[];
  educationRequirements: string[];
  fieldRequirements: string[];
  experienceRequirements: string[];
  languageRequirements: string[];
  documentRequirements: string[];
  otherRequirements: string[];
  applicationUrl: string | null;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Matcher output before an analysis id exists. Persist as Requirement in Task 28. */
export type RequirementMatch = {
  key: RequirementKey;
  text: string;
  status: RequirementStatus;
  evidence: string | null;
  reason: string;
};
export type Requirement = {
  id: string;
  analysisId: string;
  key: string;
  text: string;
  status: RequirementStatus;
  evidence: string | null;
  reason: string | null;
};

export type ReadinessItem = {
  id: string;
  analysisId: string;
  title: string;
  description: string | null;
  status: ReadinessStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Structured HULUM analysis. `decision` comes only from the deterministic engine.
 * Claude may explain this object; it must not change `decision`.
 */
export type Analysis = {
  id: string;
  userId: string;
  opportunityId: string;
  decision: Decision;
  fitScore: number;
  summary: string;
  requirements: Requirement[];
  nextAction: string;
  readiness: ReadinessItem[];
  createdAt: string;
  updatedAt: string;
};

export type VoiceResponse = {
  intent: VoiceIntent;
  spokenText: string;
  text: string;
  language: Language;
};
