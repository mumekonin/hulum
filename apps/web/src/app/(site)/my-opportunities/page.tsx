"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TYPE_LABELS,
  type AnalysisSummary,
  type Decision,
  type Opportunity,
  type SavedOpportunity,
} from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";
import { daysUntil, formatDeadline } from "@/lib/format";
import { fetchMyAnalyses, fetchSaved, unsaveOpportunity } from "@/lib/history";

const DECISION_GROUPS: Array<{ decision: Decision; heading: string; note: string }> = [
  { decision: "APPLY", heading: "Apply", note: "Key known requirements are met." },
  {
    decision: "MAYBE",
    heading: "Maybe",
    note: "Something important is uncertain or needs checking.",
  },
  { decision: "SKIP", heading: "Skip", note: "A critical requirement is not met." },
];

type Data = {
  analyses: AnalysisSummary[];
  saved: SavedOpportunity[];
  opportunities: Map<string, Opportunity>;
};

function deadlineNote(deadline: string): string {
  const remaining = daysUntil(deadline);
  if (remaining === null) return formatDeadline(deadline);
  if (remaining < 0) return `${formatDeadline(deadline)} · Closed`;
  return `${formatDeadline(deadline)} · ${remaining} ${remaining === 1 ? "day" : "days"} left`;
}

export default function MyOpportunitiesPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void Promise.all([fetchMyAnalyses(), fetchSaved(), api<Opportunity[]>("/api/opportunities")])
      .then(([analyses, saved, opportunities]) => {
        if (cancelled) return;
        setData({
          analyses,
          saved,
          opportunities: new Map(opportunities.map((item) => [item.id, item])),
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(userFacingError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function remove(opportunityId: string) {
    setRemoving(opportunityId);
    try {
      await unsaveOpportunity(opportunityId);
      setData((current) =>
        current
          ? {
              ...current,
              saved: current.saved.filter((row) => row.opportunityId !== opportunityId),
            }
          : current,
      );
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setRemoving(null);
    }
  }

  const header = (
    <header className="max-w-3xl">
      <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        My opportunities
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        What you saved and what HULUM already decided for you. Decisions come from the stored
        analysis and change only when you analyze again.
      </p>
    </header>
  );

  if (error) {
    return (
      <section>
        {header}
        <StatusPanel
          variant="error"
          title="We couldn't load your opportunities"
          primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        >
          {error}
        </StatusPanel>
      </section>
    );
  }

  if (!data) {
    return (
      <section>
        {header}
        <StatusPanel variant="loading" title="Loading your opportunities" />
      </section>
    );
  }

  const byOpportunity = new Map(data.analyses.map((row) => [row.opportunityId, row]));

  if (data.analyses.length === 0 && data.saved.length === 0) {
    return (
      <section>
        {header}
        <StatusPanel
          variant="empty"
          title="Nothing saved or analyzed yet"
          primary={{ label: "Find opportunities", href: "/opportunities" }}
          secondary={{ label: "Ask HULUM", href: "/assistant" }}
        >
          Open an opportunity, then choose Analyze my fit or Save opportunity. It will appear here.
        </StatusPanel>
      </section>
    );
  }

  return (
    <section>
      {header}

      <section className="mt-12" aria-labelledby="saved-heading">
        <h2 id="saved-heading" className="border-b border-line pb-3 font-display text-2xl">
          Saved
        </h2>
        {data.saved.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nothing saved. Use Save opportunity on any listing to keep it here.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {data.saved.map((row) => {
              const opportunity = data.opportunities.get(row.opportunityId);
              const analysis = byOpportunity.get(row.opportunityId);
              return (
                <li
                  key={row.opportunityId}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    {opportunity ? (
                      <>
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">
                          {TYPE_LABELS[opportunity.type]}
                        </p>
                        <Link
                          href={`/opportunities/${opportunity.id}`}
                          className="mt-1 block font-display text-xl leading-snug hover:underline hover:underline-offset-4"
                        >
                          {opportunity.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {opportunity.organization} · Deadline {deadlineNote(opportunity.deadline)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted">This listing is no longer in the stored catalog.</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    {analysis ? (
                      <DecisionBadge decision={analysis.decision} size="sm" />
                    ) : opportunity ? (
                      <Link
                        href={`/opportunities/${opportunity.id}`}
                        className="inline-flex min-h-11 items-center underline underline-offset-4"
                      >
                        Analyze my fit
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void remove(row.opportunityId)}
                      disabled={removing === row.opportunityId}
                      className="min-h-11 text-muted underline underline-offset-4 hover:text-ink disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {DECISION_GROUPS.map((group) => {
        const rows = data.analyses.filter((row) => row.decision === group.decision);
        if (rows.length === 0) return null;
        return (
          <section
            key={group.decision}
            className="mt-12"
            aria-labelledby={`group-${group.decision}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <h2 id={`group-${group.decision}`} className="font-display text-2xl">
                {group.heading} <span className="text-muted">· {rows.length}</span>
              </h2>
              <p className="text-sm text-muted">{group.note}</p>
            </div>
            <ul className="divide-y divide-line">
              {rows.map((row) => (
                <li key={row.analysisId} className="py-5">
                  <Link
                    href={`/opportunities/${row.opportunityId}?analysisId=${row.analysisId}`}
                    className="font-display text-xl leading-snug hover:underline hover:underline-offset-4"
                  >
                    {row.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {row.organization} · {TYPE_LABELS[row.type]} · Deadline{" "}
                    {deadlineNote(row.deadline)}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {row.readiness.total > 0
                      ? `${row.readiness.done} of ${row.readiness.total} preparation steps done`
                      : "No preparation steps"}
                    {" · "}Analyzed {formatDeadline(row.analyzedAt.slice(0, 10))}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
