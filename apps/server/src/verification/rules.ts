import { VerificationStatus, type Opportunity } from "@hulum/shared";
import type { Clock } from "../services/common/clock.js";

/**
 * VERIFIED listings older than this are shown as NEEDS_REVIEW.
 * The stored row is not rewritten; freshness is computed on read.
 */
export const VERIFICATION_STALE_AFTER_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type SourcePriority = {
  officialSourceUrl: string;
  applicationUrl: string | null;
  factAuthority: "source_url";
  applyAuthority: "application_url" | "source_url";
};

function deadlineDay(opportunity: Opportunity): string | undefined {
  const day = opportunity.deadline.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return undefined;
  }
  return day;
}

function todayUtc(clock: Clock): string {
  return clock.now().toISOString().slice(0, 10);
}

/** Deadline and eligibility facts come from sourceUrl only. Never invent a URL. */
export function sourcePriority(opportunity: Opportunity): SourcePriority {
  const officialSourceUrl = opportunity.sourceUrl.trim();
  const rawApply = opportunity.applicationUrl;
  const applicationUrl =
    rawApply === null || rawApply.trim() === "" ? null : rawApply.trim();

  return {
    officialSourceUrl,
    applicationUrl,
    factAuthority: "source_url",
    applyAuthority: applicationUrl === null ? "source_url" : "application_url",
  };
}

export function isVerificationStale(opportunity: Opportunity, clock: Clock): boolean {
  if (opportunity.verificationStatus !== VerificationStatus.VERIFIED) {
    return false;
  }
  if (opportunity.lastVerifiedAt === null) {
    return true;
  }
  const verifiedAt = Date.parse(opportunity.lastVerifiedAt);
  if (Number.isNaN(verifiedAt)) {
    return true;
  }
  const ageMs = clock.now().getTime() - verifiedAt;
  if (ageMs < 0) {
    return true;
  }
  return ageMs > VERIFICATION_STALE_AFTER_DAYS * MS_PER_DAY;
}

/**
 * Stored status is the catalog mark. Effective status is what HULUM may show:
 * expired deadline or stored EXPIRED wins; stale VERIFIED becomes NEEDS_REVIEW.
 */
export function effectiveVerificationStatus(
  opportunity: Opportunity,
  clock: Clock,
): VerificationStatus {
  if (opportunity.verificationStatus === VerificationStatus.EXPIRED) {
    return VerificationStatus.EXPIRED;
  }

  const day = deadlineDay(opportunity);
  if (day !== undefined && day < todayUtc(clock)) {
    return VerificationStatus.EXPIRED;
  }

  if (isVerificationStale(opportunity, clock)) {
    return VerificationStatus.NEEDS_REVIEW;
  }

  if (sourcePriority(opportunity).officialSourceUrl === "") {
    return VerificationStatus.NEEDS_REVIEW;
  }

  return opportunity.verificationStatus;
}

export function presentOpportunity(opportunity: Opportunity, clock: Clock): Opportunity {
  return {
    ...opportunity,
    verificationStatus: effectiveVerificationStatus(opportunity, clock),
  };
}
