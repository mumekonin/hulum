import { z } from "zod";
import type { ProfileExtractProposal, ProfileExtractResult } from "@hulum/shared";
import type { ChatMessage } from "./groq.js";

export const PROFILE_EXTRACT_SYSTEM_PROMPT =
  "You extract structured HULUM profile fields from the user's self-description. Output JSON only. Never invent credentials, documents, or countries the user did not state. Use null or [] when unknown. Do not claim eligibility.";

const proposalSchema = z.object({
  educationLevel: z.string().min(1).max(80).nullable().optional(),
  fieldOfStudy: z.string().min(1).max(120).nullable().optional(),
  graduationYear: z.number().int().min(1950).max(2100).nullable().optional(),
  country: z.string().min(1).max(80).nullable().optional(),
  city: z.string().min(1).max(80).nullable().optional(),
  languages: z.array(z.string().min(1).max(40)).max(12).optional(),
  skills: z.array(z.string().min(1).max(40)).max(20).optional(),
  experience: z.string().min(1).max(500).nullable().optional(),
  interests: z.array(z.string().min(1).max(40)).max(20).optional(),
});

const EMPTY: ProfileExtractProposal = {
  educationLevel: null,
  fieldOfStudy: null,
  graduationYear: null,
  country: null,
  city: null,
  languages: [],
  skills: [],
  experience: null,
  interests: [],
};

export const PROFILE_EXTRACT_NOTICE =
  "These fields are proposed only. Confirm or edit them on your profile before HULUM uses them. Voice cannot silently change stored facts.";

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? trimmed).trim();
  return JSON.parse(raw) as unknown;
}

function cleanStrings(values: string[] | undefined): string[] {
  if (values === undefined) return [];
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed && !out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}

export function emptyProfileExtract(): ProfileExtractResult {
  return {
    proposed: { ...EMPTY, languages: [], skills: [], interests: [] },
    filledFields: [],
    confirmationRequired: true,
    notice: PROFILE_EXTRACT_NOTICE,
  };
}

export function buildProfileExtractMessages(text: string): ChatMessage[] {
  return [
    { role: "system", content: PROFILE_EXTRACT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Extract profile JSON with keys educationLevel, fieldOfStudy, graduationYear, country, city, languages, skills, experience, interests from this text:\n${text.trim()}`,
    },
  ];
}

/** Validate model JSON into a proposal. Malformed output → empty proposal (still confirmationRequired). */
export function profileExtractFromModelText(raw: string): ProfileExtractResult {
  let parsed: unknown;
  try {
    parsed = parseJsonObject(raw);
  } catch {
    return emptyProfileExtract();
  }

  const schema = proposalSchema.safeParse(parsed);
  if (!schema.success) {
    return emptyProfileExtract();
  }

  const data = schema.data;
  const proposed: ProfileExtractProposal = {
    educationLevel: data.educationLevel ?? null,
    fieldOfStudy: data.fieldOfStudy ?? null,
    graduationYear: data.graduationYear ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    languages: cleanStrings(data.languages),
    skills: cleanStrings(data.skills),
    experience: data.experience ?? null,
    interests: cleanStrings(data.interests),
  };

  const filledFields = (Object.keys(proposed) as Array<keyof ProfileExtractProposal>).filter(
    (key) => {
      const value = proposed[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== "";
    },
  );

  return {
    proposed,
    filledFields,
    confirmationRequired: true,
    notice: PROFILE_EXTRACT_NOTICE,
  };
}

export function formatProfileExtractReply(result: ProfileExtractResult): string {
  if (result.filledFields.length === 0) {
    return `I could not extract clear profile facts from that text. ${result.notice}`;
  }
  const parts = result.filledFields.map((field) => {
    const value = result.proposed[field];
    const shown = Array.isArray(value) ? value.join(", ") : String(value);
    return `${field}: ${shown}`;
  });
  return `Proposed profile facts (not saved yet): ${parts.join("; ")}. ${result.notice}`;
}
