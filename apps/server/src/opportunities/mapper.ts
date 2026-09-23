import {
  OpportunityType,
  VerificationStatus,
  type Opportunity,
} from "@hulum/shared";
import { seedOpportunities } from "../data/seedOpportunities.js";

export type OpportunityRow = {
  id: string;
  title: string;
  organization: string;
  type: string;
  description: string;
  deadline: Date | string;
  country_eligibility: string[];
  education_requirements: string[];
  field_requirements: string[];
  experience_requirements: string[];
  language_requirements: string[];
  document_requirements: string[];
  other_requirements: string[];
  application_url: string | null;
  source_url: string;
  verification_status: string;
  last_verified_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function isOpportunityType(value: string): value is OpportunityType {
  return Object.values(OpportunityType).some((type) => type === value);
}

function isVerificationStatus(value: string): value is VerificationStatus {
  return Object.values(VerificationStatus).some((status) => status === value);
}

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

function toIsoDateTime(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

export function mapOpportunityRow(row: OpportunityRow): Opportunity {
  if (!isOpportunityType(row.type)) {
    throw new Error("Opportunity type in the database is not a locked contract value");
  }
  if (!isVerificationStatus(row.verification_status)) {
    throw new Error("Opportunity verification_status in the database is not a locked contract value");
  }

  const mapped: Opportunity = {
    id: row.id,
    title: row.title,
    organization: row.organization,
    type: row.type,
    description: row.description,
    deadline: toIsoDate(row.deadline),
    countryEligibility: row.country_eligibility,
    educationRequirements: row.education_requirements,
    fieldRequirements: row.field_requirements,
    experienceRequirements: row.experience_requirements,
    languageRequirements: row.language_requirements,
    documentRequirements: row.document_requirements,
    otherRequirements: row.other_requirements,
    applicationUrl: row.application_url,
    sourceUrl: row.source_url,
    verificationStatus: row.verification_status,
    lastVerifiedAt: row.last_verified_at === null ? null : toIsoDateTime(row.last_verified_at),
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
  };
  const seed = seedOpportunities.find(
    (item) => item.title === mapped.title && item.sourceUrl === mapped.sourceUrl,
  );
  if (seed?.requirements !== undefined) {
    return { ...mapped, requirements: seed.requirements };
  }
  return mapped;
}
