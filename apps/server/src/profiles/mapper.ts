import type { Profile } from "@hulum/shared";

export type ProfileRow = {
  id: string;
  user_id: string;
  education_level: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  country: string | null;
  city: string | null;
  languages: string[];
  skills: string[];
  experience: string | null;
  interests: string[];
  created_at: Date | string;
  updated_at: Date | string;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
};

function toIsoDateTime(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    educationLevel: row.education_level,
    fieldOfStudy: row.field_of_study,
    graduationYear: row.graduation_year,
    country: row.country,
    city: row.city,
    languages: row.languages,
    skills: row.skills,
    experience: row.experience,
    interests: row.interests,
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
  };
}
