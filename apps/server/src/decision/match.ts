import {
  AFRICAN_COUNTRIES,
  EDUCATION_RANK,
  type EducationLevel,
  type OpportunityRequirement,
  type Profile,
  type RequirementMatcher,
  type RequirementStatus,
} from "@hulum/shared";

export type MatchOutcome = {
  status: RequirementStatus;
  evidence: string;
  reason: string;
};

function norm(value: string): string {
  return value.trim().toLowerCase();
}

function includesAny(haystack: string[], needles: string[]): boolean {
  const hay = haystack.map(norm);
  return needles.some((needle) => hay.some((item) => item.includes(norm(needle)) || norm(needle).includes(item)));
}

function isAfrican(country: string): boolean {
  const value = norm(country);
  if (value === "africa" || value === "african") return true;
  return AFRICAN_COUNTRIES.some((item) => norm(item) === value);
}

function educationValue(level: EducationLevel): number {
  return EDUCATION_RANK[level];
}

function matchCountry(profile: Profile, values: string[]): MatchOutcome {
  const allowed = values.map(norm);
  const country = norm(profile.country);
  const africaOk = allowed.some((value) => value === "africa" || value === "african countries" || value === "african");
  const direct = allowed.includes(country);
  const continent = africaOk && isAfrican(profile.country);

  if (direct || continent) {
    return {
      status: "MET",
      evidence: `Profile country is ${profile.country}.`,
      reason: "Country eligibility includes this applicant.",
    };
  }

  return {
    status: "NOT_MET",
    evidence: `Profile country is ${profile.country}.`,
    reason: `Opportunity is limited to: ${values.join(", ")}.`,
  };
}

function matchEducation(profile: Profile, level: EducationLevel, enrolledOk?: boolean): MatchOutcome {
  const have = educationValue(profile.educationLevel);
  const need = educationValue(level);
  const inProgress = profile.educationLevel.endsWith("_in_progress");

  if (enrolledOk && have >= educationValue("bachelor_in_progress")) {
    return {
      status: "MET",
      evidence: `Education level is ${profile.educationLevel}.`,
      reason: "The opportunity accepts currently enrolled university students.",
    };
  }

  if (have >= need && !inProgress) {
    return {
      status: "MET",
      evidence: `Education level is ${profile.educationLevel}.`,
      reason: "Completed education meets or exceeds the stated minimum.",
    };
  }

  if (inProgress && have >= need - 1) {
    return {
      status: "UNCERTAIN",
      evidence: `Education level is ${profile.educationLevel}, graduating ${profile.graduationYear}.`,
      reason: "The opportunity may require a completed credential rather than current enrollment.",
    };
  }

  return {
    status: "NOT_MET",
    evidence: `Education level is ${profile.educationLevel}.`,
    reason: `Minimum stated education is ${level}.`,
  };
}

function matchField(profile: Profile, values: string[]): MatchOutcome {
  const blob = [profile.fieldOfStudy, ...profile.skills, ...profile.interests].join(" ");
  const hit = values.some((value) => norm(blob).includes(norm(value)) || norm(value).includes(norm(profile.fieldOfStudy)));

  if (hit) {
    return {
      status: "MET",
      evidence: `Field of study is ${profile.fieldOfStudy}.`,
      reason: "Field, skills, or interests overlap the stated requirement.",
    };
  }

  return {
    status: "UNCERTAIN",
    evidence: `Field of study is ${profile.fieldOfStudy}.`,
    reason: "Field fit is not explicit in the profile and needs verification against the official description.",
  };
}

function matchLanguage(profile: Profile, values: string[]): MatchOutcome {
  if (includesAny(profile.languages, values)) {
    return {
      status: "MET",
      evidence: `Languages: ${profile.languages.join(", ")}.`,
      reason: "A required working language is listed in the profile.",
    };
  }

  return {
    status: "NOT_MET",
    evidence: `Languages: ${profile.languages.join(", ") || "none listed"}.`,
    reason: `Required language(s): ${values.join(", ")}.`,
  };
}

function matchExperience(profile: Profile, years: number): MatchOutcome {
  if (profile.yearsExperience >= years) {
    return {
      status: "MET",
      evidence: `${profile.yearsExperience} year(s) of experience. ${profile.experience}`.trim(),
      reason: "Stated experience meets the minimum.",
    };
  }

  if (profile.yearsExperience === 0 && profile.experience.trim().length > 0) {
    return {
      status: "UNCERTAIN",
      evidence: profile.experience,
      reason: `Experience is described but not quantified against the ${years}-year minimum.`,
    };
  }

  return {
    status: "NOT_MET",
    evidence: `${profile.yearsExperience} year(s) of experience. ${profile.experience}`.trim(),
    reason: `Opportunity asks for about ${years} year(s) of experience.`,
  };
}

function matchDocuments(profile: Profile, values: string[]): MatchOutcome {
  const missing = values.filter((doc) => !includesAny(profile.documentsHeld, [doc]));
  if (missing.length === 0) {
    return {
      status: "MET",
      evidence: `Documents held: ${profile.documentsHeld.join(", ")}.`,
      reason: "Required documents are already listed in the profile.",
    };
  }

  return {
    status: "UNCERTAIN",
    evidence: `Documents held: ${profile.documentsHeld.join(", ") || "none listed"}.`,
    reason: `Still needed: ${missing.join(", ")}. Documents can usually be prepared before applying.`,
  };
}

function matchDeadline(deadline: string): MatchOutcome {
  const due = new Date(`${deadline}T23:59:59.000Z`);
  const now = new Date();
  if (Number.isNaN(due.getTime())) {
    return {
      status: "UNCERTAIN",
      evidence: `Stored deadline is ${deadline}.`,
      reason: "Deadline could not be parsed. Confirm on the official source.",
    };
  }

  if (due.getTime() < now.getTime()) {
    return {
      status: "NOT_MET",
      evidence: `Deadline ${deadline} has passed.`,
      reason: "HULUM does not recommend applying after the stated deadline.",
    };
  }

  return {
    status: "MET",
    evidence: `Deadline ${deadline} is still open according to stored data.`,
    reason: "Confirm the deadline on the official source before investing application time.",
  };
}

export function matchRequirement(
  profile: Profile,
  requirement: OpportunityRequirement,
  deadline: string,
): MatchOutcome {
  const matcher: RequirementMatcher = requirement.matcher;

  switch (matcher.type) {
    case "country":
      return matchCountry(profile, matcher.values);
    case "education_min":
      return matchEducation(profile, matcher.level, matcher.enrolledOk);
    case "field":
      return matchField(profile, matcher.values);
    case "language":
      return matchLanguage(profile, matcher.values);
    case "experience_min":
      return matchExperience(profile, matcher.years);
    case "documents":
      return matchDocuments(profile, matcher.values);
    case "deadline_open":
      return matchDeadline(deadline);
    case "always_uncertain":
      return {
        status: "UNCERTAIN",
        evidence: "This requirement is not fully represented in the structured profile.",
        reason: requirement.text,
      };
    case "always_met":
      return {
        status: "MET",
        evidence: "No structured conflict with the profile.",
        reason: requirement.text,
      };
    case "age_max":
      return {
        status: "UNCERTAIN",
        evidence: "Date of birth is not stored in the v0.1 profile.",
        reason: `Confirm you are under ${matcher.years} if the official source requires it.`,
      };
    default:
      return {
        status: "UNCERTAIN",
        evidence: "Matcher is not implemented.",
        reason: requirement.text,
      };
  }
}
