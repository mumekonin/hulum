export { fail, ok } from "./api.js";
export type { APIError, ApiEnvelope, ApiFailure, ApiSuccess } from "./api.js";
export {
  Decision,
  Language,
  OpportunityType,
  ReadinessStatus,
  RequirementKey,
  RequirementStatus,
  VerificationStatus,
  VoiceIntent,
  isDecision,
  isVoiceIntent,
} from "./enums.js";
export type {
  Analysis,
  AnalyzeOpportunityRequest,
  DecisionResult,
  Opportunity,
  Profile,
  ReadinessItem,
  Requirement,
  RequirementMatch,
  VoiceResponse,
} from "./types.js";
export { PROFILE_COMPLETENESS_FIELDS, profileCompleteness } from "./profile.js";
export type {
  CreateProfileRequest,
  PatchProfileRequest,
  ProfileCompleteness,
  ProfileCompletenessField,
  ProfileView,
  ProfileWrite,
} from "./profile.js";
