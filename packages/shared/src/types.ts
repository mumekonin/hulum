import type {
  DECISIONS,
  EDUCATION_LEVELS,
  FitCategory,
  LANGUAGES,
  OPPORTUNITY_TYPES,
  READINESS_PRIORITIES,
  READINESS_STATUSES,
  REQUIREMENT_STATUSES,
  VERIFICATION_STATUSES,
  VOICE_INTENTS,
} from "./constants";

export type LanguageCode = (typeof LANGUAGES)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type Decision = (typeof DECISIONS)[number];
export type RequirementStatus = (typeof REQUIREMENT_STATUSES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
export type ReadinessStatus = (typeof READINESS_STATUSES)[number];
export type ReadinessPriority = (typeof READINESS_PRIORITIES)[number];
export type VoiceIntent = (typeof VOICE_INTENTS)[number];

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
  name: string;
  educationLevel: EducationLevel;
  fieldOfStudy: string;
  graduationYear: number;
  country: string;
  city?: string;
  languages: string[];
  skills: string[];
  experience: string;
  yearsExperience: number;
  interests: string[];
  documentsHeld: string[];
  preferredLanguage: LanguageCode;
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
  educationRequirements: string;
  fieldRequirements: string;
  experienceRequirements: string;
  languageRequirements: string;
  documentRequirements: string[];
  otherRequirements: string[];
  applicationUrl: string;
  sourceUrl: string;
  sourceType: string;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;
  requirements: OpportunityRequirement[];
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

export type ReadinessItem = {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  status: ReadinessStatus;
  priority: ReadinessPriority;
  reason?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

export type Analysis = {
  id: string;
  userId: string;
  opportunityId: string;
  decision: Decision;
  fitScore: number;
  summary: string;
  nextAction: string;
  explanation: string;
  disclaimer: string;
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

export type AnalysisDetail = Analysis & {
  opportunity: Opportunity;
  profile: Profile;
  requirements: RequirementResult[];
  readiness: ReadinessItem[];
  gaps: AnalysisContract["gaps"];
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
