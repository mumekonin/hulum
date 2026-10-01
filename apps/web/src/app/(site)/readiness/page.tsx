"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AnalysisSummary } from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";
import { StatusPanel } from "@/components/StatusPanel";
import { userFacingError } from "@/lib/api";
import { daysUntil, formatDeadline } from "@/lib/format";
import { fetchMyAnalyses } from "@/lib/history";

function isOpen(row: AnalysisSummary): boolean {
  const remaining = daysUntil(row.deadline);
  return remaining === null || remaining >= 0;
}

function ProgressRow({ row }: { row: AnalysisSummary }) {
  const { done, total } = row.readiness;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const remaining = daysUntil(row.deadline);
  const href = `/opportunities/${row.opportunityId}?analysisId=${row.analysisId}#readiness-heading`;
  return (
    <li className="py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <Link
          href={href}
          className="font-display text-xl leading-snug hover:underline hover:underline-offset-4"
        >
          {row.title}
        </Link>
        <span className="self-start sm:self-auto">
          <DecisionBadge decision={row.decision} size="sm" />
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {row.organization} · Deadline {formatDeadline(row.deadline)}
        {remaining === null
          ? ""
          : remaining < 0
            ? " · Closed"
            : ` · ${remaining} ${remaining === 1 ? "day" : "days"} left`}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="h-1 flex-1 bg-surface-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-label={`${row.title} preparation`}
        >
          <div className="h-1 bg-ink" style={{ width: `${percent}%` }} />
        </div>
        <p className="shrink-0 text-sm tabular-nums">
          {done} of {total} done
        </p>
      </div>
      <Link
        href={href}
        className="mt-2 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        {done === total ? "Review steps" : "Continue preparing"}
      </Link>
    </li>
  );
}

export default function ReadinessPage() {
  const [rows, setRows] = useState<AnalysisSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void fetchMyAnalyses()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(userFacingError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const header = (
    <header className="max-w-3xl">
      <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Readiness</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        What is left to prepare for each opportunity you analyzed, soonest deadline first. HULUM
        never submits applications; you apply on the official website.
      </p>
    </header>
  );

  if (error) {
    return (
      <section>
        {header}
        <StatusPanel
          variant="error"
          title="We couldn't load your preparation steps"
          primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        >
          {error}
        </StatusPanel>
      </section>
    );
  }

  if (!rows) {
    return (
      <section>
        {header}
        <StatusPanel variant="loading" title="Loading preparation steps" />
      </section>
    );
  }

  const withSteps = rows
    .filter((row) => row.readiness.total > 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const open = withSteps.filter(isOpen);
  const closed = withSteps.filter((row) => !isOpen(row));

  if (withSteps.length === 0) {
    return (
      <section>
        {header}
        <StatusPanel
          variant="empty"
          title="No preparation steps yet"
          primary={{ label: "Find opportunities", href: "/opportunities" }}
        >
          Analyze an opportunity and HULUM lists what to prepare, based on its stored requirements.
        </StatusPanel>
      </section>
    );
  }

  return (
    <section>
      {header}
      {open.length > 0 ? (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {open.map((row) => (
            <ProgressRow key={row.analysisId} row={row} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 border-t border-line pt-6 text-muted">
          Every analyzed opportunity with preparation steps has closed.
        </p>
      )}
      {closed.length > 0 ? (
        <details className="mt-10 border-t border-line pt-4">
          <summary className="min-h-11 cursor-pointer py-2 text-sm text-muted hover:text-ink">
            Closed deadlines ({closed.length})
          </summary>
          <ul className="divide-y divide-line">
            {closed.map((row) => (
              <ProgressRow key={row.analysisId} row={row} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
