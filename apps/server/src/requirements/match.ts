import {
  RequirementKey,
  RequirementStatus,
  type Opportunity,
  type Profile,
  type RequirementMatch,
} from "@hulum/shared";
import { documentLabelCovers } from "../profiles/documentExtract.js";
import type { Clock } from "../services/common/clock.js";
import {
  asStringList,
  canonicalEducation,
  countryEligible,
  educationDisplay,
  educationMeets,
  fieldsOverlap,
  hasText,
  isOfficialConfirmNotice,
  isSoftRequirement,
  languageIds,
  parseEducationNeed,
  parseMinYears,
  snippetAround,
} from "./normalize.js";

type MatchPick = Pick<RequirementMatch, "status" | "evidence" | "reason">;

function deniesListedExperience(text: string): boolean {
  return /\bno (work |professional )?experience\b|\bno work history\b|\bzero years\b|\bhave not worked\b/i.test(
    text,
  );
}

function documentSnippet(profile: Profile, terms: string[]): string | null {
  const documentText = profile.documentText ?? "";
  if (documentText.trim() === "") {
    return null;
  }
  return snippetAround(documentText, terms);
}

function countryStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list a country requirement.",
    };
  }
  if (!hasText(profile.country)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: "Your profile does not include a country, so eligibility cannot be confirmed.",
    };
  }
  const country = profile.country.trim();
  if (countryEligible(country, required)) {
    return {
      status: RequirementStatus.MET,
      evidence: `Your country is ${country}.`,
      reason: `Your country (${country}) is eligible for this listing (${required.join(", ")}).`,
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence: `Your country is ${country}.`,
    reason: `Your country (${country}) is not in the listed eligibility: ${required.join(", ")}.`,
  };
}

function educationStatus(profile: Profile, required: string[], clock: Clock): MatchPick {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list an education requirement.",
    };
  }
  if (!hasText(profile.educationLevel)) {
    const quote = documentSnippet(profile, required);
    if (quote !== null) {
      return {
        status: RequirementStatus.UNCERTAIN,
        evidence: `Uploaded document text: "${quote}"`,
        reason:
          "Your uploaded document mentions education wording, but HULUM still needs a saved education level to mark this as met.",
      };
    }
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: "Your profile does not include an education level, so this requirement cannot be confirmed.",
    };
  }

  const educationLevel = profile.educationLevel.trim();
  const have = canonicalEducation(educationLevel);
  const inProgress = educationLevel.endsWith("_in_progress") || (have?.endsWith("_in_progress") ?? false);
  const graduationYear = profile.graduationYear;
  const currentYear = clock.now().getUTCFullYear();
  if (inProgress && typeof graduationYear === "number" && graduationYear < currentYear) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Education is ${educationDisplay(educationLevel)}; graduation year ${graduationYear}.`,
      reason:
        "Current enrollment conflicts with a graduation year that is already in the past. Confirm status on the official source.",
    };
  }

  const need = parseEducationNeed(required);
  const listed = required.join("; ");
  const label = educationDisplay(educationLevel);
  const evidence = `Your education is ${label}.`;

  if (need.kind === "open") {
    return {
      status: RequirementStatus.MET,
      evidence,
      reason: `Your education (${label}) can be used here; the listing does not treat a specific degree as the main gate.`,
    };
  }
  if (need.kind === "unknown") {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence,
      reason: `Your education is ${label}. Confirm this wording on the official source: ${listed}.`,
    };
  }
  if (need.kind === "none") {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list an education requirement.",
    };
  }
  if (have === null) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence,
      reason: `Your saved education (${educationLevel}) is not a standard level HULUM can compare. Confirm: ${listed}.`,
    };
  }
  const outcome = educationMeets(have, need);
  if (outcome === "met") {
    return {
      status: RequirementStatus.MET,
      evidence,
      reason: `Your education (${label}) meets the listed requirement: ${listed}.`,
    };
  }
  if (outcome === "uncertain") {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence,
      reason: `Your education (${label}) may still need a completed credential. Confirm: ${listed}.`,
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence,
    reason: `Your education (${label}) does not meet the listed requirement: ${listed}.`,
  };
}

function fieldStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list a field requirement.",
    };
  }
  const listed = required.join("; ");
  const field = profile.fieldOfStudy;
  if (hasText(field) && fieldsOverlap(field, required)) {
    return {
      status: RequirementStatus.MET,
      evidence: `Your field of study is ${field.trim()}.`,
      reason: `Your field of study (${field.trim()}) matches the listing: ${listed}.`,
    };
  }
  const extras = [...profile.skills, ...profile.interests];
  const extraHit = extras.some((item) => fieldsOverlap(item, required));
  if (extraHit && hasText(field)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Your field of study is ${field.trim()}; skills/interests: ${extras.join(", ")}.`,
      reason:
        "Your saved field of study does not match, but your skills or interests do. Confirm the official field requirement.",
    };
  }
  const quote = documentSnippet(profile, [...required, field ?? ""]);
  if (!hasText(field)) {
    if (quote !== null && fieldsOverlap(quote, required)) {
      return {
        status: RequirementStatus.UNCERTAIN,
        evidence: `Uploaded document text: "${quote}"`,
        reason:
          "Your uploaded document mentions the listed field, but HULUM never marks field MET from OCR alone. Save your field of study to confirm.",
      };
    }
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: "Your profile does not include a field of study, so this requirement cannot be confirmed.",
    };
  }
  if (quote !== null && fieldsOverlap(quote, required)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Your field of study is ${field.trim()}. Uploaded document text: "${quote}"`,
      reason:
        "Your saved field of study does not match; uploaded document text overlaps the listing. Confirm the official field requirement.",
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence: `Your field of study is ${field.trim()}.`,
    reason: `Your field of study (${field.trim()}) is not in the listed fields: ${listed}.`,
  };
}

function languageStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list language requirements.",
    };
  }
  if (profile.languages.length === 0) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: "Your profile has no languages, so language requirements cannot be confirmed.",
    };
  }
  const needed = languageIds(required);
  const held = languageIds(profile.languages);
  const evidence = `Your languages: ${profile.languages.join(", ")}.`;
  if (needed.length === 0) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence,
      reason: `Your languages are ${profile.languages.join(", ")}. Confirm this wording on the official source: ${required.join("; ")}.`,
    };
  }
  const missing = needed.filter((code) => !held.includes(code));
  if (missing.length === 0) {
    return {
      status: RequirementStatus.MET,
      evidence,
      reason: `Your languages (${profile.languages.join(", ")}) cover the listing: ${required.join("; ")}.`,
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence,
    reason: `Your languages (${profile.languages.join(", ")}) are missing a listed language: ${required.join("; ")}.`,
  };
}

function experienceStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0 || required.every(isSoftRequirement)) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: hasText(profile.experience) ? `Your experience: ${profile.experience.trim()}` : null,
      reason:
        required.length === 0
          ? "The opportunity does not list experience requirements."
          : "The listing treats experience as optional or helpful, not a hard gate.",
    };
  }
  const yearsRequired = parseMinYears(required);
  const yearsExperience = profile.yearsExperience ?? 0;
  const experience = profile.experience ?? "";
  const listed = required.join("; ");

  if (yearsExperience > 0 && deniesListedExperience(experience)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Years of experience: ${yearsExperience}. Written experience: ${experience}`,
      reason:
        "Years of experience conflict with the written experience description. Confirm before treating this as met.",
    };
  }

  if (yearsRequired !== null && yearsExperience >= yearsRequired && !deniesListedExperience(experience)) {
    return {
      status: RequirementStatus.MET,
      evidence: `Years of experience: ${yearsExperience}. ${experience}`.trim(),
      reason: `Your profile lists ${yearsExperience} year(s) of experience, which meets the listed minimum.`,
    };
  }

  if (hasText(experience)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Your experience: ${experience.trim()}`,
      reason: `Your profile experience is "${experience.trim()}". HULUM cannot mark this MET from wording alone. Confirm: ${listed}.`,
    };
  }

  const quote = documentSnippet(profile, required);
  if (quote !== null) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Uploaded document text: "${quote}"`,
      reason:
        "Uploaded document text mentions experience terms, but HULUM never marks experience MET from OCR alone. Confirm on the official source.",
    };
  }
  return {
    status: RequirementStatus.UNCERTAIN,
    evidence: yearsExperience > 0 ? `Years of experience: ${yearsExperience}` : null,
    reason: "Your profile has no experience text, so experience requirements cannot be confirmed.",
  };
}

function documentsStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list document requirements.",
    };
  }
  const held = profile.documentsHeld ?? [];
  const documentText = (profile.documentText ?? "").trim();
  if (held.length === 0 && documentText === "") {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: "You have no uploaded documents on file, so document requirements cannot be confirmed.",
    };
  }
  const missing = required.filter((doc) => !documentLabelCovers(held, doc));
  const textNote = documentText === "" ? "" : " Readable text from your uploads was used in this analysis.";
  if (missing.length === 0) {
    return {
      status: RequirementStatus.MET,
      evidence: `Documents on file: ${held.join(", ") || "none"}.${textNote}`,
      reason: "Required documents are already listed from your uploads.",
    };
  }
  return {
    status: RequirementStatus.UNCERTAIN,
    evidence: `Documents on file: ${held.join(", ") || "none"}.${textNote}`,
    reason: `Still needed from your uploads: ${missing.join(", ")}. Documents can usually be prepared before applying.`,
  };
}

function otherStatus(profile: Profile, required: string[]): MatchPick {
  if (required.length === 0 || required.every(isOfficialConfirmNotice)) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason:
        required.length === 0
          ? "The opportunity does not list other requirements."
          : "The extra listing notes ask you to confirm the official source, which HULUM already requires.",
    };
  }
  const listed = required.join("; ");
  const quote = documentSnippet(profile, required);
  if (quote !== null) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Uploaded document text: "${quote}"`,
      reason: `Your uploaded document may be relevant, but this extra requirement still needs confirmation: ${listed}.`,
    };
  }
  return {
    status: RequirementStatus.UNCERTAIN,
    evidence: hasText(profile.experience) ? `Your experience: ${profile.experience.trim()}` : null,
    reason: `This extra requirement cannot be confirmed from structured profile facts: ${listed}.`,
  };
}

function deadlineStatus(opportunity: Opportunity, clock: Clock): MatchPick {
  const deadline = opportunity.deadline.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(deadline)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `Stored deadline: ${opportunity.deadline}`,
      reason: "The deadline is not a valid YYYY-MM-DD date.",
    };
  }
  const today = clock.now().toISOString().slice(0, 10);
  const day = deadline.slice(0, 10);
  if (day < today) {
    return {
      status: RequirementStatus.NOT_MET,
      evidence: `Deadline ${day}; today ${today}`,
      reason: "The application deadline has passed.",
    };
  }
  return {
    status: RequirementStatus.MET,
    evidence: `Deadline ${day}; today ${today}`,
    reason: `The application deadline (${day}) has not passed.`,
  };
}

/**
 * Deterministic matcher. Same profile + opportunity + clock.now() date
 * always returns the same statuses. Never infers MET from OCR or similar wording.
 */
export function matchRequirements(profile: Profile, opportunity: Opportunity, clock: Clock): RequirementMatch[] {
  const educationRequirements = asStringList(opportunity.educationRequirements);
  const fieldRequirements = asStringList(opportunity.fieldRequirements);
  const languageRequirements = asStringList(opportunity.languageRequirements);
  const experienceRequirements = asStringList(opportunity.experienceRequirements);

  const country = countryStatus(profile, opportunity.countryEligibility);
  const education = educationStatus(profile, educationRequirements, clock);
  const field = fieldStatus(profile, fieldRequirements);
  const language = languageStatus(profile, languageRequirements);
  const experience = experienceStatus(profile, experienceRequirements);
  const documents = documentsStatus(profile, opportunity.documentRequirements);
  const other = otherStatus(profile, opportunity.otherRequirements);
  const deadline = deadlineStatus(opportunity, clock);

  return [
    { key: RequirementKey.COUNTRY, text: opportunity.countryEligibility.join(", ") || "Country eligibility", ...country },
    { key: RequirementKey.EDUCATION, text: educationRequirements.join(", ") || "Education requirement", ...education },
    { key: RequirementKey.FIELD, text: fieldRequirements.join(", ") || "Field requirement", ...field },
    { key: RequirementKey.LANGUAGE, text: languageRequirements.join(", ") || "Language requirement", ...language },
    { key: RequirementKey.EXPERIENCE, text: experienceRequirements.join(", ") || "Experience requirement", ...experience },
    { key: RequirementKey.DOCUMENTS, text: opportunity.documentRequirements.join(", ") || "Document requirement", ...documents },
    { key: RequirementKey.DEADLINE, text: `Deadline ${opportunity.deadline}`, ...deadline },
    { key: RequirementKey.OTHER, text: opportunity.otherRequirements.join(", ") || "Other requirements", ...other },
  ];
}
