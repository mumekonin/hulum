"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TYPE_LABELS, type AnalysisDetail, type Opportunity } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { api } from "@/lib/api";
import { formatDeadline } from "@/lib/format";
import { getUserId } from "@/lib/storage";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    void api<Opportunity>(`/api/opportunities/${params.id}`)
      .then(setOpportunity)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  async function analyze() {
    const userId = getUserId();
    if (!userId) {
      router.push("/profile");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const analysis = await api<AnalysisDetail>(`/api/opportunities/${params.id}/analyze`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      router.push(`/analysis/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't analyze this opportunity right now.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (error && !opportunity) return <p className="text-skip">{error}</p>;
  if (!opportunity) return <p>Loading opportunity…</p>;

  return (
    <article className="max-w-3xl">
      <p className="text-sm uppercase tracking-wide text-muted">
        {TYPE_LABELS[opportunity.type]} · {opportunity.verificationStatus.replace("_", " ")}
      </p>
      <h1 className="mt-2 font-display text-4xl">{opportunity.title}</h1>
      <p className="mt-2 text-lg text-muted">{opportunity.organization}</p>
      <p className="mt-6 leading-7">{opportunity.description}</p>
      <dl className="mt-8 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-muted">Deadline</dt>
          <dd>{formatDeadline(opportunity.deadline)}</dd>
        </div>
        <div>
          <dt className="text-muted">Last verified</dt>
          <dd>{opportunity.lastVerifiedAt.slice(0, 10)}</dd>
        </div>
        <div>
          <dt className="text-muted">Country eligibility</dt>
          <dd>{opportunity.countryEligibility.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-muted">Education</dt>
          <dd>{opportunity.educationRequirements}</dd>
        </div>
      </dl>
      <h2 className="mt-10 font-display text-2xl">Requirements</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
        <li>{opportunity.educationRequirements}</li>
        <li>{opportunity.fieldRequirements}</li>
        <li>{opportunity.experienceRequirements}</li>
        <li>{opportunity.languageRequirements}</li>
        {opportunity.documentRequirements.map((doc) => (
          <li key={doc}>{doc}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => void analyze()} disabled={analyzing} className="bg-ink px-5 py-3 text-paper disabled:opacity-60">
          {analyzing ? "Analyzing…" : "Analyze for me"}
        </button>
        <a href={opportunity.applicationUrl} target="_blank" rel="noreferrer" className="border border-ink px-5 py-3">
          Official application
        </a>
        <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="px-5 py-3 text-muted">
          Official source
        </a>
      </div>
      {error ? <p className="mt-4 text-skip">{error}</p> : null}
      <div className="mt-6">
        <Notice>
          Always confirm eligibility and deadlines with the official organization.{" "}
          <Link href="/profile" className="underline">
            Need a profile first?
          </Link>
        </Notice>
      </div>
    </article>
  );
}
