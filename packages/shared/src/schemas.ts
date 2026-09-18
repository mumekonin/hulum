import { z } from "zod";
import {
  DECISIONS,
  EDUCATION_LEVELS,
  LANGUAGES,
  OPPORTUNITY_TYPES,
  READINESS_STATUSES,
  REQUIREMENT_STATUSES,
} from "./constants";

export const languageSchema = z.enum(LANGUAGES);
export const educationLevelSchema = z.enum(EDUCATION_LEVELS);
export const opportunityTypeSchema = z.enum(OPPORTUNITY_TYPES);
export const decisionSchema = z.enum(DECISIONS);
export const requirementStatusSchema = z.enum(REQUIREMENT_STATUSES);
export const readinessStatusSchema = z.enum(READINESS_STATUSES);

export const profileInputSchema = z.object({
  userId: z.string().min(1).optional(),
  name: z.string().min(2).max(120),
  educationLevel: educationLevelSchema,
  fieldOfStudy: z.string().min(2).max(120),
  graduationYear: z.number().int().min(1980).max(2040),
  country: z.string().min(2).max(80),
  city: z.string().max(80).optional(),
  languages: z.array(z.string().min(1)).min(1),
  skills: z.array(z.string().min(1)).default([]),
  experience: z.string().max(500).default(""),
  yearsExperience: z.number().min(0).max(50).default(0),
  interests: z.array(z.string().min(1)).default([]),
  documentsHeld: z.array(z.string().min(1)).default([]),
  preferredLanguage: languageSchema.default("en"),
});

export const profilePatchSchema = profileInputSchema.partial();

export const analyzeRequestSchema = z.object({
  userId: z.string().min(1),
});

export const voiceActionSchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1).max(2000),
  language: languageSchema.optional(),
  opportunityId: z.string().optional(),
  analysisId: z.string().optional(),
});

export const readinessPatchSchema = z.object({
  status: readinessStatusSchema,
});

export const analysisContractSchema = z.object({
  decision: decisionSchema,
  fitScore: z.number().int().min(0).max(100),
  summary: z.string(),
  nextAction: z.string(),
  explanation: z.string(),
  disclaimer: z.string(),
  requirements: z.array(
    z.object({
      key: z.string(),
      status: requirementStatusSchema,
      evidence: z.string(),
      reason: z.string(),
      critical: z.boolean(),
      requirementText: z.string(),
    }),
  ),
  gaps: z.array(
    z.object({
      requirement: z.string(),
      status: requirementStatusSchema,
      remediation: z.string(),
    }),
  ),
  readiness: z.array(
    z.object({
      title: z.string(),
      status: readinessStatusSchema,
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
});
