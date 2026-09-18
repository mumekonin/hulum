"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AnalysisDetail, ReadinessItem } from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";
import { Notice } from "@/components/Notice";
import { ReadinessList } from "@/components/ReadinessList";
import { RequirementList } from "@/components/RequirementList";
import { api } from "@/lib/api";

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<AnalysisDetail>(`/api/analyses/${params.id}`)
      .then(setAnalysis)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  function replaceReadiness(item: ReadinessItem) {
    setAnalysis((current) =>
      current
        ? { ...current, readiness: current.readiness.map((row) => (row.id === item.id ? item : row)) }
        : current,
    );
  }

  if (error) return <p className="text-skip">{error}</p>;
  if (!analysis) return <p>Loading analysis…</p>;

  const matched = analysis.requirements.filter((item) => item.status === "MET");
  const attention = analysis.requirements.filter((item) => item.status !== "MET");

  return (
    <article className="max-w-3xl">
      <p className="text-sm uppercase tracking-wide text-muted">{analysis.opportunity.title}</p>
      <div className="mt-4 flex flex-wrap items-end gap-6">
        <DecisionBadge decision={analysis.decision} size="lg" />
        <p className="font-display text-4xl">{analysis.fitScore}% FIT</p>
      </div>
      <p className="mt-6 text-lg leading-8">{analysis.explanation}</p>
      <p className="mt-4 border-l-4 border-forest pl-4 text-sm">
        <span className="font-medium">Next action.</span> {analysis.nextAction}
      </p>

      <h2 className="mt-12 font-display text-2xl">Matched</h2>
      <div className="mt-4">
        <RequirementList items={matched} />
        {matched.length === 0 ? <p className="text-muted">No matched requirements.</p> : null}
      </div>

      <h2 className="mt-12 font-display text-2xl">Needs attention</h2>
      <div className="mt-4">
        <RequirementList items={attention} />
        {attention.length === 0 ? <p className="text-muted">No uncertain or missing requirements.</p> : null}
      </div>

      <h2 className="mt-12 font-display text-2xl">Readiness</h2>
      <div className="mt-4">
        <ReadinessList items={analysis.readiness} onChange={replaceReadiness} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href={analysis.opportunity.applicationUrl} target="_blank" rel="noreferrer" className="bg-ink px-5 py-3 text-paper">
          Apply officially
        </a>
        <Link href={`/assistant?analysisId=${analysis.id}&opportunityId=${analysis.opportunityId}`} className="border border-ink px-5 py-3">
          Ask HULUM
        </Link>
        <Link href="/opportunities" className="px-5 py-3 text-muted">
          Back to opportunities
        </Link>
      </div>
      <div className="mt-8">
        <Notice>{analysis.disclaimer}</Notice>
      </div>
    </article>
  );
}
