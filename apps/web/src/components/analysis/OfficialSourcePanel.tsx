import { OFFICIAL_SOURCE_NOTICE, type Opportunity } from "@hulum/shared";
import { ExternalLink } from "@/components/ExternalLink";
import { btnPrimary, btnSecondary } from "@/lib/ui";

/** Links only to URLs stored on the opportunity. applicationUrl wins when present. */
export function OfficialSourcePanel({ opportunity }: { opportunity: Opportunity }) {
  const primaryHref = opportunity.applicationUrl ?? opportunity.sourceUrl;
  const primaryLabel = opportunity.applicationUrl
    ? "Apply on official website"
    : "View official opportunity";
  const showSourceLink =
    opportunity.applicationUrl !== null && opportunity.applicationUrl !== opportunity.sourceUrl;

  return (
    <section
      aria-labelledby="official-source-heading"
      className="border border-line bg-surface p-5"
    >
      <h2
        id="official-source-heading"
        className="text-xs font-medium uppercase tracking-[0.14em] text-muted"
      >
        Official source
      </h2>
      <p className="mt-3 text-sm leading-6">
        Verify final eligibility, deadlines, and application instructions with the official
        organization. HULUM does not submit applications.
      </p>
      <ExternalLink
        href={primaryHref}
        className={`mt-4 w-full ${btnPrimary}`}
      >
        {primaryLabel}
      </ExternalLink>
      {showSourceLink ? (
        <ExternalLink
          href={opportunity.sourceUrl}
          className={`mt-2 w-full ${btnSecondary}`}
        >
          View official opportunity
        </ExternalLink>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-muted">{OFFICIAL_SOURCE_NOTICE}</p>
    </section>
  );
}
