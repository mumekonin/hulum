import type { CreateProfileRequest, PatchProfileRequest, ProfileWrite } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmedString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "INVALID_INPUT", `${field} must be a non-empty string.`);
  }
  return value.trim();
}

function asOptionalText(value: unknown, field: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_INPUT", `${field} must be a string or null.`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function asStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new HttpError(400, "INVALID_INPUT", `${field} must be an array of strings.`);
  }
  return value.map((item) => item.trim()).filter((item) => item !== "");
}

function asGraduationYear(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1950 || value > 2100) {
    throw new HttpError(400, "INVALID_INPUT", "graduationYear must be an integer between 1950 and 2100.");
  }
  return value;
}

const emptyWrite: ProfileWrite = {
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

export function parseCreateProfileRequest(
  body: unknown,
): { name: string; email: string; userId?: string } & ProfileWrite {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_INPUT", "Request body must be an object.");
  }
  const input = body as CreateProfileRequest;
  const name = asTrimmedString(input.name, "name");
  const email = asTrimmedString(input.email, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "INVALID_INPUT", "email must be a valid email address.");
  }

  let userId: string | undefined;
  if (input.userId !== undefined) {
    if (typeof input.userId !== "string" || !isUuid(input.userId)) {
      throw new HttpError(400, "INVALID_ID", "userId must be a UUID when provided.");
    }
    userId = input.userId;
  }

  return {
    name,
    email,
    ...(userId === undefined ? {} : { userId }),
    educationLevel: asOptionalText(input.educationLevel, "educationLevel") ?? emptyWrite.educationLevel,
    fieldOfStudy: asOptionalText(input.fieldOfStudy, "fieldOfStudy") ?? emptyWrite.fieldOfStudy,
    graduationYear: asGraduationYear(input.graduationYear) ?? emptyWrite.graduationYear,
    country: asOptionalText(input.country, "country") ?? emptyWrite.country,
    city: asOptionalText(input.city, "city") ?? emptyWrite.city,
    languages: asStringArray(input.languages, "languages") ?? emptyWrite.languages,
    skills: asStringArray(input.skills, "skills") ?? emptyWrite.skills,
    experience: asOptionalText(input.experience, "experience") ?? emptyWrite.experience,
    interests: asStringArray(input.interests, "interests") ?? emptyWrite.interests,
  };
}

export function parsePatchProfileRequest(body: unknown): PatchProfileRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_INPUT", "Request body must be an object.");
  }
  const input = body as PatchProfileRequest;
  const patch: PatchProfileRequest = {};

  const educationLevel = asOptionalText(input.educationLevel, "educationLevel");
  if (educationLevel !== undefined) patch.educationLevel = educationLevel;
  const fieldOfStudy = asOptionalText(input.fieldOfStudy, "fieldOfStudy");
  if (fieldOfStudy !== undefined) patch.fieldOfStudy = fieldOfStudy;
  const graduationYear = asGraduationYear(input.graduationYear);
  if (graduationYear !== undefined) patch.graduationYear = graduationYear;
  const country = asOptionalText(input.country, "country");
  if (country !== undefined) patch.country = country;
  const city = asOptionalText(input.city, "city");
  if (city !== undefined) patch.city = city;
  const languages = asStringArray(input.languages, "languages");
  if (languages !== undefined) patch.languages = languages;
  const skills = asStringArray(input.skills, "skills");
  if (skills !== undefined) patch.skills = skills;
  const experience = asOptionalText(input.experience, "experience");
  if (experience !== undefined) patch.experience = experience;
  const interests = asStringArray(input.interests, "interests");
  if (interests !== undefined) patch.interests = interests;

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, "INVALID_INPUT", "At least one profile field is required.");
  }
  return patch;
}
