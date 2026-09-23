import Link from "next/link";
import type { Opportunity } from "@hulum/shared";
import { TYPE_LABELS } from "@hulum/shared";
import { daysUntil, formatDeadline } from "@/lib/format";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const remaining = daysUntil(opportunity.deadline);
  const expired = remaining != null && remaining < 0;

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="block border border-line bg-white/70 p-5 transition hover:border-ink"
    >
      <span className="sr-only">
        {expired ? "Deadline closed in stored data. " : remaining != null && remaining >= 0 ? `${remaining} days left. ` : ""}
      </span>
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted">
        <span>{TYPE_LABELS[opportunity.type]}</span>
        <span aria-hidden="true">·</span>
        <span>
          {opportunity.verificationStatus === "VERIFIED"
            ? "Verified source"
            : opportunity.verificationStatus === "AI_EXTRACTED"
              ? "AI-extracted, not yet verified"
              : opportunity.verificationStatus}
        </span>
      </div>
      <h2 className="mt-3 font-display text-2xl leading-tight">{opportunity.title}</h2>
      <p className="mt-1 text-muted">{opportunity.organization}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-6">{opportunity.description}</p>
      <p className={`mt-4 text-sm ${expired ? "text-skip" : "text-muted"}`}>
        Deadline {formatDeadline(opportunity.deadline)}
        {remaining != null && remaining >= 0 ? ` · ${remaining} days left` : expired ? " · closed in stored data" : ""}
      </p>
    </Link>
  );
}
