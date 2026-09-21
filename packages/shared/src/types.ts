import type {
  EDUCATION_LEVELS,
  FitCategory,
  LANGUAGES,
  READINESS_PRIORITIES,
  VOICE_INTENTS,
} from "./constants.js";
import type {
  Decision,
  OpportunityType,
  ReadinessStatus,
  RequirementKey,
  RequirementStatus,
  VerificationStatus,
  Language,
  VoiceIntent as LockedVoiceIntent,
} from "./enums.js";

export type LanguageCode = (typeof LANGUAGES)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type { Decision, OpportunityType, ReadinessStatus, RequirementStatus, VerificationStatus };
export type ReadinessPriority = (typeof READINESS_PRIORITIES)[number];
export type VoiceIntent = (typeof VOICE_INTENTS)[number] | LockedVoiceIntent;

export type ApiError = {
  message: string;
  code?: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  preferredLanguage: LanguageCode;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  id: string;
  userId: string;
  name?: string;
  educationLevel: EducationLevel | string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  country: string | null;
  city?: string | null;
  languages: string[];
  skills: string[];
  experience: string | null;
  yearsExperience?: number;
  interests: string[];
  documentsHeld?: string[];
  preferredLanguage?: LanguageCode;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt"> & {
  userId?: string;
};

export type RequirementMatcher =
  | { type: "country"; values: string[] }
  | { type: "education_min"; level: EducationLevel; enrolledOk?: boolean }
  | { type: "field"; values: string[] }
  | { type: "language"; values: string[] }
  | { type: "experience_min"; years: number }
  | { type: "documents"; values: string[] }
  | { type: "deadline_open" }
  | { type: "age_max"; years: number }
  | { type: "always_uncertain" }
  | { type: "always_met" };

export type OpportunityRequirement = {
  key: string;
  category: FitCategory;
  text: string;
  critical: boolean;
  matcher: RequirementMatcher;
};

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  deadline: string;
  countryEligibility: string[];
  educationRequirements: string | string[];
  fieldRequirements: string | string[];
  experienceRequirements: string | string[];
  languageRequirements: string | string[];
  documentRequirements: string[];
  otherRequirements: string[];
  applicationUrl: string | null;
  sourceUrl: string;
  sourceType?: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  requirements?: OpportunityRequirement[];
  createdAt: string;
  updatedAt: string;
};

export type RequirementResult = {
  id: string;
  analysisId: string;
  key: string;
  requirementText: string;
  status: RequirementStatus;
  evidence: string;
  reason: string;
  critical: boolean;
  category: string;
};

/** Matcher output before an analysis id exists. Persist as Requirement. */
export type RequirementMatch = {
  key: RequirementKey;
  text: string;
  status: RequirementStatus;
  evidence: string | null;
  reason: string;
};

export type DecisionAudit = {
  /** Which engine branch produced the final decision (expired can override). */
  rulePath: "critical_not_met" | "keys_met_no_uncertainty" | "default_maybe" | "expired_override";
  criticalKeys: string[];
  keyRequirementKeys: string[];
  criticalNotMet: string[];
  keyStatuses: Record<string, RequirementStatus>;
  uncertainKeys: string[];
  effectiveVerificationStatus: VerificationStatus;
  fitScoreIsAdvisoryOnly: true;
  decidedAt: string;
};

export type DecisionResult = {
  decision: Decision;
  fitScore: number;
  matchedRequirements: RequirementMatch[];
  missingRequirements: RequirementMatch[];
  uncertainRequirements: RequirementMatch[];
  reasons: string[];
  nextAction: string;
  /** Deterministic debug trail. Not shown as a user-facing guarantee. */
  audit: DecisionAudit;
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
  priority: ReadinessPriority | number;
  reason?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Structured HULUM analysis. `decision` comes only from the deterministic engine.
 * Groq may explain this object; it must not change `decision`.
 */
export type Analysis = {
  id: string;
  userId: string;
  opportunityId: string;
  decision: Decision;
  fitScore: number;
  summary: string;
  nextAction: string;
  explanation?: string;
  disclaimer?: string;
  requirements?: Requirement[];
  readiness?: ReadinessItem[];
  createdAt: string;
  updatedAt: string;
};

export type AnalysisContract = {
  decision: Decision;
  fitScore: number;
  summary: string;
  nextAction: string;
  explanation: string;
  disclaimer: string;
  requirements: Array<{
    key: string;
    status: RequirementStatus;
    evidence: string;
    reason: string;
    critical: boolean;
    requirementText: string;
  }>;
  gaps: Array<{
    requirement: string;
    status: RequirementStatus;
    remediation: string;
  }>;
  readiness: Array<{
    title: string;
    status: ReadinessStatus;
    description: string;
    priority: ReadinessPriority;
  }>;
};

export type AnalysisDetail = Omit<Analysis, "requirements" | "readiness"> & {
  opportunity: Opportunity;
  profile: Profile;
  requirements: RequirementResult[];
  readiness: ReadinessItem[];
  gaps: AnalysisContract["gaps"];
};

export type AnalyzeOpportunityRequest = {
  userId: string;
};

export type PatchReadinessRequest = {
  status: ReadinessStatus;
};

export type ExplainAnalysisRequest = {
  language?: Language;
};

export type AnalysisExplanation = {
  analysisId: string;
  decision: Decision;
  fitScore: number;
  nextAction: string;
  explanation: string;
  language: Language;
};

export type VoiceActionRequest = {
  userId: string;
  text: string;
  language?: LanguageCode;
  opportunityId?: string;
  analysisId?: string;
};

export type VoiceActionResponse = {
  intent: VoiceIntent;
  reply: string;
  analysis?: AnalysisDetail;
  opportunities?: Opportunity[];
  opportunity?: Opportunity;
};

export type VoiceResponse = {
  intent: LockedVoiceIntent;
  spokenText: string;
  text: string;
  language: import("./enums.js").Language;
};
