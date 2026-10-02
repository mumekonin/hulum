import Link from "next/link";
import { TYPE_LABELS, type Decision, type Opportunity, type VerificationStatus } from "@hulum/shared";
import { DecisionBadge } from "./DecisionBadge";
import { daysUntil, formatDeadline, requirementLines } from "@/lib/format";

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: "Verified source",
  AI_EXTRACTED: "AI-extracted, not yet verified",
  NEEDS_REVIEW: "Source needs review",
  EXPIRED: "Expired",
};

function listSummary(values: string[], max = 3): string {
  if (values.length <= max) return values.join(", ");
  return `${values.slice(0, max).join(", ")} +${values.length - max} more`;
}

function eligibilitySummary(opportunity: Opportunity): string | null {
  const parts: string[] = [];
  if (opportunity.countryEligibility.length > 0)
    parts.push(listSummary(opportunity.countryEligibility));
  const education = requirementLines(opportunity.educationRequirements)[0];
  if (education) parts.push(education);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function OpportunityRow({
  opportunity,
  decision,
}: {
  opportunity: Opportunity;
  /** The user's stored decide() result, if they analyzed this listing. */
  decision?: Decision;
}) {
  const remaining = daysUntil(opportunity.deadline);
  const closed = remaining !== null && remaining < 0;
  const eligibility = eligibilitySummary(opportunity);
  const verified = opportunity.verificationStatus === "VERIFIED";

  return (
    <article className="group relative py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">
            {TYPE_LABELS[opportunity.type]}
          </p>
          <h2 className="mt-2 font-display text-2xl leading-snug">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4"
            >
              {opportunity.title}
            </Link>
          </h2>
          <p className="mt-1 text-muted">{opportunity.organization}</p>
        </div>
        <p className={`shrink-0 text-sm sm:text-right ${closed ? "text-skip" : "text-ink"}`}>
          <span className="text-muted">Deadline · </span>
          {formatDeadline(opportunity.deadline)}
          <span className="block text-muted">
            {closed
              ? "Closed"
              : remaining !== null
                ? `${remaining} ${remaining === 1 ? "day" : "days"} left`
                : ""}
          </span>
        </p>
      </div>
      <p className="mt-4 line-clamp-2 max-w-3xl leading-7">{opportunity.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {decision ? (
          <span className="inline-flex items-center gap-2">
            Your fit <DecisionBadge decision={decision} size="sm" />
          </span>
        ) : null}
        {eligibility ? <span>{eligibility}</span> : null}
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 rounded-full ${verified ? "bg-apply" : "bg-line-strong"}`}
          />
          {VERIFICATION_LABELS[opportunity.verificationStatus]}
        </span>
      </div>
    </article>
  );
}
