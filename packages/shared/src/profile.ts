import type { Profile } from "./types.js";

export const PROFILE_COMPLETENESS_FIELDS = [
  "educationLevel",
  "fieldOfStudy",
  "graduationYear",
  "country",
  "city",
  "languages",
  "skills",
  "experience",
  "interests",
] as const;

export type ProfileCompletenessField = (typeof PROFILE_COMPLETENESS_FIELDS)[number];

export type ProfileCompleteness = {
  complete: boolean;
  missing: ProfileCompletenessField[];
};

export type ProfileWrite = {
  educationLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  country: string | null;
  city: string | null;
  languages: string[];
  skills: string[];
  experience: string | null;
  interests: string[];
};

export type CreateProfileRequest = {
  name: string;
  email: string;
} & Partial<ProfileWrite>;

export type PatchProfileRequest = Partial<ProfileWrite>;

/** AI-proposed profile fields. Never auto-saved — user must confirm. */
export type ProfileExtractProposal = {
  educationLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  country: string | null;
  city: string | null;
  languages: string[];
  skills: string[];
  experience: string | null;
  interests: string[];
};

export type ProfileExtractResult = {
  proposed: ProfileExtractProposal;
  filledFields: Array<keyof ProfileExtractProposal>;
  confirmationRequired: true;
  notice: string;
};

export type ProfileView = {
  name: string;
  email: string;
  profile: Profile;
  completeness: ProfileCompleteness;
};

function isMissingText(value: string | null | undefined): boolean {
  return value === undefined || value === null || value.trim() === "";
}

export function profileCompleteness(profile: Profile): ProfileCompleteness {
  const missing: ProfileCompletenessField[] = [];

  if (isMissingText(profile.educationLevel)) missing.push("educationLevel");
  if (isMissingText(profile.fieldOfStudy)) missing.push("fieldOfStudy");
  if (profile.graduationYear === null) missing.push("graduationYear");
  if (isMissingText(profile.country)) missing.push("country");
  if (isMissingText(profile.city)) missing.push("city");
  if (profile.languages.length === 0) missing.push("languages");
  if (profile.skills.length === 0) missing.push("skills");
  if (isMissingText(profile.experience)) missing.push("experience");
  if (profile.interests.length === 0) missing.push("interests");

  return { complete: missing.length === 0, missing };
}
