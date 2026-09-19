import {
  RequirementKey,
  RequirementStatus,
  type Opportunity,
  type Profile,
  type RequirementMatch,
} from "@hulum/shared";
import type { Clock } from "../services/common/clock.js";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function hasText(value: string | null): value is string {
  return value !== null && value.trim() !== "";
}

function normalizedSet(values: string[]): Set<string> {
  return new Set(values.map(normalize).filter((value) => value !== ""));
}

function memberStatus(
  profileValue: string | null,
  required: string[],
  labels: { profile: string; requirement: string },
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: `The opportunity does not list a ${labels.requirement} requirement.`,
    };
  }
  if (!hasText(profileValue)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: `The profile does not include ${labels.profile}, so this requirement cannot be confirmed.`,
    };
  }
  const allowed = normalizedSet(required);
  const actual = normalize(profileValue);
  if (allowed.has(actual)) {
    return {
      status: RequirementStatus.MET,
      evidence: `${labels.profile}=${profileValue.trim()}`,
      reason: `The profile ${labels.profile} is in the opportunity list.`,
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence: `${labels.profile}=${profileValue.trim()}`,
    reason: `The profile ${labels.profile} is not in the opportunity list.`,
  };
}

function languageStatus(profile: Profile, required: string[]): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
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
      reason: "The profile has no languages, so language requirements cannot be confirmed.",
    };
  }
  const held = normalizedSet(profile.languages);
  const missing = required.map(normalize).filter((code) => code !== "" && !held.has(code));
  if (missing.length === 0) {
    return {
      status: RequirementStatus.MET,
      evidence: `languages=${profile.languages.join(", ")}`,
      reason: "The profile includes every listed language requirement.",
    };
  }
  return {
    status: RequirementStatus.NOT_MET,
    evidence: `languages=${profile.languages.join(", ")}`,
    reason: "The profile is missing one or more listed languages.",
  };
}

function deadlineStatus(opportunity: Opportunity, clock: Clock): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  const deadline = opportunity.deadline.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(deadline)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `deadline=${opportunity.deadline}`,
      reason: "The deadline is not a valid YYYY-MM-DD date.",
    };
  }
  const today = clock.now().toISOString().slice(0, 10);
  const day = deadline.slice(0, 10);
  if (day < today) {
    return {
      status: RequirementStatus.NOT_MET,
      evidence: `deadline=${day}; today=${today}`,
      reason: "The application deadline has passed.",
    };
  }
  return {
    status: RequirementStatus.MET,
    evidence: `deadline=${day}; today=${today}`,
    reason: "The application deadline has not passed.",
  };
}

function unstructuredStatus(
  required: string[],
  missingProfileFact: boolean,
  labels: { name: string; whyUncertain: string },
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: `The opportunity does not list ${labels.name} requirements.`,
    };
  }
  if (missingProfileFact) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: null,
      reason: labels.whyUncertain,
    };
  }
  return {
    status: RequirementStatus.UNCERTAIN,
    evidence: null,
    reason: `HULUM cannot confirm ${labels.name} from structured profile facts. Never guess MET.`,
  };
}

/**
 * Deterministic matcher. Same profile + opportunity + clock.now() date
 * always returns the same statuses. Never infers MET from similar wording.
 */
export function matchRequirements(profile: Profile, opportunity: Opportunity, clock: Clock): RequirementMatch[] {
  const country = memberStatus(profile.country, opportunity.countryEligibility, {
    profile: "country",
    requirement: "country",
  });
  const education = memberStatus(profile.educationLevel, opportunity.educationRequirements, {
    profile: "educationLevel",
    requirement: "education",
  });
  const field = memberStatus(profile.fieldOfStudy, opportunity.fieldRequirements, {
    profile: "fieldOfStudy",
    requirement: "field",
  });
  const language = languageStatus(profile, opportunity.languageRequirements);
  const experience = unstructuredStatus(opportunity.experienceRequirements, !hasText(profile.experience), {
    name: "experience",
    whyUncertain: "The profile has no experience text, so experience requirements cannot be confirmed.",
  });
  const documents = unstructuredStatus(opportunity.documentRequirements, true, {
    name: "document",
    whyUncertain: "The profile has no document facts, so document requirements cannot be confirmed.",
  });
  const other = unstructuredStatus(opportunity.otherRequirements, true, {
    name: "other",
    whyUncertain: "Other requirements cannot be confirmed from structured profile facts.",
  });
  const deadline = deadlineStatus(opportunity, clock);

  return [
    { key: RequirementKey.COUNTRY, text: opportunity.countryEligibility.join(", ") || "Country eligibility", ...country },
    { key: RequirementKey.EDUCATION, text: opportunity.educationRequirements.join(", ") || "Education requirement", ...education },
    { key: RequirementKey.FIELD, text: opportunity.fieldRequirements.join(", ") || "Field requirement", ...field },
    { key: RequirementKey.LANGUAGE, text: opportunity.languageRequirements.join(", ") || "Language requirement", ...language },
    { key: RequirementKey.EXPERIENCE, text: opportunity.experienceRequirements.join(", ") || "Experience requirement", ...experience },
    { key: RequirementKey.DOCUMENTS, text: opportunity.documentRequirements.join(", ") || "Document requirement", ...documents },
    { key: RequirementKey.DEADLINE, text: `Deadline ${opportunity.deadline}`, ...deadline },
    { key: RequirementKey.OTHER, text: opportunity.otherRequirements.join(", ") || "Other requirements", ...other },
  ];
}
