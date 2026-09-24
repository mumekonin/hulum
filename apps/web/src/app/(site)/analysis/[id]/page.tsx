"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OFFICIAL_SOURCE_NOTICE, type Analysis, type Opportunity, type ReadinessItem } from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";
import { DecisionAuditPanel } from "@/components/DecisionAuditPanel";
import { ExternalLink } from "@/components/ExternalLink";
import { Notice } from "@/components/Notice";
import { ReadinessList } from "@/components/ReadinessList";
import { RequirementList } from "@/components/RequirementList";
import { StatusPanel } from "@/components/StatusPanel";
import { api, isNotFound, userFacingError } from "@/lib/api";

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setMissing(false);
    setAnalysis(null);
    setOpportunity(null);
    void api<Analysis>(`/api/analyses/${params.id}`)
      .then(async (data) => {
        if (cancelled) return;
        setAnalysis(data);
        if (!data.opportunityId) return;
        try {
          const item = await api<Opportunity>(`/api/opportunities/${data.opportunityId}`);
          if (!cancelled) setOpportunity(item);
        } catch {
          if (!cancelled) setOpportunity(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setMissing(true);
          return;
        }
        setError(userFacingError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [params.id, reloadKey]);

  function replaceReadiness(item: ReadinessItem) {
    setAnalysis((current) =>
      current
        ? { ...current, readiness: (current.readiness ?? []).map((row) => (row.id === item.id ? item : row)) }
        : current,
    );
  }

  if (error) {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load this analysis"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        secondary={{ label: "Back to opportunities", href: "/opportunities" }}
      >
        {error}
      </StatusPanel>
    );
  }

  if (missing) {
    return (
      <StatusPanel
        variant="empty"
        title="This analysis is not available"
        primary={{ label: "Browse opportunities", href: "/opportunities" }}
        secondary={{ label: "Create a profile", href: "/profile" }}
      >
        This analysis is not in Postgres. Open an opportunity and analyze it again.
      </StatusPanel>
    );
  }

  if (!analysis) {
    return (
      <StatusPanel variant="loading" title="Loading analysis">
        Fetching APPLY / MAYBE / SKIP, matched requirements, and the readiness checklist.
      </StatusPanel>
    );
  }

  const requirements = analysis.requirements ?? [];
  const readiness = analysis.readiness ?? [];
  const matched = requirements.filter((item) => item.status === "MET");
  const attention = requirements.filter((item) => item.status !== "MET");

  return (
    <article className="max-w-3xl">
      <p className="text-sm uppercase tracking-wide text-muted">{opportunity?.title ?? "Stored analysis"}</p>
      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-sm font-medium text-muted">Decision</p>
          <div className="mt-2">
            <DecisionBadge decision={analysis.decision} size="lg" />
          </div>
        </div>
        <p className="font-display text-4xl" aria-label={`Fit score ${analysis.fitScore} percent. Fit is a signal only and does not replace the decision.`}>
          {analysis.fitScore}% FIT
        </p>
      </div>
      <p className="mt-6 text-lg leading-8">{analysis.summary}</p>
      <p className="mt-4 border-l-4 border-forest pl-4 text-sm">
        <span className="font-medium">Next action.</span> {analysis.nextAction}
      </p>

      <h2 className="mt-12 font-display text-2xl">Matched</h2>
      <p className="mt-2 text-sm text-muted">Each row includes why the engine marked it MET.</p>
      <div className="mt-4">
        {matched.length === 0 ? (
          <StatusPanel variant="empty" title="No matched requirements">
            Nothing on this profile is marked MET for this opportunity.
          </StatusPanel>
        ) : (
          <RequirementList items={matched} />
        )}
      </div>

      <h2 className="mt-12 font-display text-2xl">Needs attention</h2>
      <p className="mt-2 text-sm text-muted">
        Missing or uncertain requirements, each with a short explanation. Confirm on the official source.
      </p>
      <div className="mt-4">
        {attention.length === 0 ? (
          <StatusPanel variant="empty" title="No gaps on this analysis">
            No uncertain or missing requirements were recorded.
          </StatusPanel>
        ) : (
          <RequirementList items={attention} />
        )}
      </div>

      <h2 className="mt-12 font-display text-2xl">Readiness</h2>
      <div className="mt-4">
        {readiness.length === 0 ? (
          <StatusPanel variant="empty" title="No readiness items yet">
            This analysis did not generate a checklist.
          </StatusPanel>
        ) : (
          <ReadinessList items={readiness} onChange={replaceReadiness} />
        )}
      </div>

      {analysis.audit ? <DecisionAuditPanel audit={analysis.audit} /> : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {opportunity?.applicationUrl ? (
          <ExternalLink href={opportunity.applicationUrl} className="inline-flex min-h-11 items-center bg-ink px-5 py-3 text-paper">
            Apply officially
          </ExternalLink>
        ) : null}
        {opportunity?.sourceUrl ? (
          <ExternalLink href={opportunity.sourceUrl} className="inline-flex min-h-11 items-center border border-ink px-5 py-3">
            Official source
          </ExternalLink>
        ) : null}
        <Link href={`/assistant?analysisId=${analysis.id}&opportunityId=${analysis.opportunityId}`} className="inline-flex min-h-11 items-center border border-ink px-5 py-3">
          Ask HULUM
        </Link>
        <Link href="/opportunities" className="inline-flex min-h-11 items-center px-5 py-3 text-muted">
          Back to opportunities
        </Link>
      </div>
      <div className="mt-8">
        <Notice>{analysis.disclaimer ?? OFFICIAL_SOURCE_NOTICE}</Notice>
      </div>
    </article>
  );
}
