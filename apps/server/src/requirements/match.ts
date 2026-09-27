import {
  RequirementKey,
  RequirementStatus,
  type Opportunity,
  type Profile,
  type RequirementMatch,
} from "@hulum/shared";
import { documentLabelCovers } from "../profiles/documentExtract.js";
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

function asStringList(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === "" ? [] : [trimmed];
}

function fieldOverlaps(text: string, values: string[]): boolean {
  if (!text.trim()) {
    return false;
  }
  return values.some(
    (value) => normalize(text).includes(normalize(value)) || normalize(value).includes(normalize(text)),
  );
}

function deniesListedExperience(text: string): boolean {
  return /\bno (work |professional )?experience\b|\bno work history\b|\bzero years\b|\bhave not worked\b/i.test(
    text,
  );
}

function educationStatus(
  profile: Profile,
  required: string[],
  clock: Clock,
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  const base = memberStatus(profile.educationLevel, required, {
    profile: "educationLevel",
    requirement: "education",
  });
  const educationLevel = profile.educationLevel ?? "";
  const inProgress = educationLevel.endsWith("_in_progress");
  const graduationYear = profile.graduationYear;
  const currentYear = clock.now().getUTCFullYear();

  if (inProgress && typeof graduationYear === "number" && graduationYear < currentYear) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `educationLevel=${educationLevel}; graduationYear=${graduationYear}`,
      reason:
        "Current enrollment conflicts with a graduation year that is already in the past. Confirm status on the official source.",
    };
  }
  return base;
}

function fieldStatus(
  profile: Profile,
  required: string[],
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  const base = memberStatus(profile.fieldOfStudy, required, {
    profile: "fieldOfStudy",
    requirement: "field",
  });
  if (required.length === 0 || base.status !== RequirementStatus.NOT_MET) {
    if (
      required.length > 0 &&
      base.status === RequirementStatus.UNCERTAIN &&
      !hasText(profile.fieldOfStudy)
    ) {
      const documentText = profile.documentText ?? "";
      if (documentText.trim() !== "" && fieldOverlaps(documentText, required)) {
        return {
          status: RequirementStatus.UNCERTAIN,
          evidence: "uploaded document text mentions listed field terms",
          reason:
            "Uploaded document text mentions field terms, but HULUM never marks field MET from OCR alone. Confirm the official field requirement.",
        };
      }
    }
    return base;
  }
  const field = profile.fieldOfStudy ?? "";
  const extras = [...profile.skills, ...profile.interests];
  const extraHit = extras.some((item) => fieldOverlaps(item, required));
  if (extraHit && field.trim()) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `fieldOfStudy=${field}; skills/interests=${extras.join(", ")}`,
      reason:
        "Declared field of study does not match, but skills or interests do. Confirm the official field requirement before treating this as a fit.",
    };
  }
  return base;
}

function experienceStatus(
  profile: Profile,
  required: string[],
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
  if (required.length === 0) {
    return {
      status: RequirementStatus.NOT_APPLICABLE,
      evidence: null,
      reason: "The opportunity does not list experience requirements.",
    };
  }
  const yearsExperience = profile.yearsExperience ?? 0;
  const experience = profile.experience ?? "";
  if (yearsExperience > 0 && deniesListedExperience(experience)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: `yearsExperience=${yearsExperience}; experience=${experience}`,
      reason:
        "Years of experience conflict with the written experience description. Confirm before treating this as met.",
    };
  }
  if (hasText(experience)) {
    return unstructuredStatus(required, false, {
      name: "experience",
      whyUncertain: "The profile has no experience text, so experience requirements cannot be confirmed.",
    });
  }
  const documentText = profile.documentText ?? "";
  if (documentText.trim() !== "" && fieldOverlaps(documentText, required)) {
    return {
      status: RequirementStatus.UNCERTAIN,
      evidence: "uploaded document text mentions listed experience terms",
      reason:
        "Uploaded document text mentions experience terms, but HULUM never marks experience MET from OCR alone. Confirm on the official source.",
    };
  }
  return unstructuredStatus(required, true, {
    name: "experience",
    whyUncertain: "The profile has no experience text, so experience requirements cannot be confirmed.",
  });
}

function documentsStatus(
  profile: Profile,
  required: string[],
): Pick<RequirementMatch, "status" | "evidence" | "reason"> {
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
      reason: "The profile has no document facts, so document requirements cannot be confirmed.",
    };
  }
  const missing = required.filter((doc) => !documentLabelCovers(held, doc));
  const textNote = documentText === "" ? "" : " Readable text is on file for uploaded documents.";
  if (missing.length === 0) {
    return {
      status: RequirementStatus.MET,
      evidence: `Documents held: ${held.join(", ") || "none"}.${textNote}`,
      reason: "Required documents are already listed from your uploads.",
    };
  }
  return {
    status: RequirementStatus.UNCERTAIN,
    evidence: `Documents held: ${held.join(", ") || "none"}.${textNote}`,
    reason: `Still needed: ${missing.join(", ")}. Documents can usually be prepared before applying.`,
  };
}

/**
 * Deterministic matcher. Same profile + opportunity + clock.now() date
 * always returns the same statuses. Never infers MET from similar wording.
 */
export function matchRequirements(profile: Profile, opportunity: Opportunity, clock: Clock): RequirementMatch[] {
  const educationRequirements = asStringList(opportunity.educationRequirements);
  const fieldRequirements = asStringList(opportunity.fieldRequirements);
  const languageRequirements = asStringList(opportunity.languageRequirements);
  const experienceRequirements = asStringList(opportunity.experienceRequirements);

  const country = memberStatus(profile.country, opportunity.countryEligibility, {
    profile: "country",
    requirement: "country",
  });
  const education = educationStatus(profile, educationRequirements, clock);
  const field = fieldStatus(profile, fieldRequirements);
  const language = languageStatus(profile, languageRequirements);
  const experience = experienceStatus(profile, experienceRequirements);
  const documents = documentsStatus(profile, opportunity.documentRequirements);
  const other = unstructuredStatus(opportunity.otherRequirements, true, {
    name: "other",
    whyUncertain: "Other requirements cannot be confirmed from structured profile facts.",
  });
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
