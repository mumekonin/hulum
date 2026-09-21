"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TYPE_LABELS, type AnalysisDetail, type Opportunity } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { ExternalLink } from "@/components/ExternalLink";
import { StatusPanel } from "@/components/StatusPanel";
import { api, isNotFound, userFacingError } from "@/lib/api";
import { formatDeadline, formatRequirementList } from "@/lib/format";
import { getUserId } from "@/lib/storage";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setMissing(false);
    setOpportunity(null);
    void api<Opportunity>(`/api/opportunities/${params.id}`)
      .then((data) => {
        if (!cancelled) setOpportunity(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setMissing(true);
          return;
        }
        setLoadError(userFacingError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [params.id, reloadKey]);

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
      setError(userFacingError(err) || "We couldn't analyze this opportunity right now.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loadError) {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load this opportunity"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        secondary={{ label: "Back to opportunities", href: "/opportunities" }}
      >
        {loadError}
      </StatusPanel>
    );
  }

  if (missing) {
    return (
      <StatusPanel
        variant="empty"
        title="This opportunity is not in the current list"
        primary={{ label: "Browse opportunities", href: "/opportunities" }}
      >
        It may have been removed from the stored records. Open the list and pick another sourced
        opportunity.
      </StatusPanel>
    );
  }

  if (!opportunity) {
    return (
      <StatusPanel variant="loading" title="Loading opportunity">
        Fetching the official source, deadline, and structured requirements.
      </StatusPanel>
    );
  }

  const needsProfile = error?.toLowerCase().includes("profile");

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
          <dd>{opportunity.lastVerifiedAt?.slice(0, 10) ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt className="text-muted">Country eligibility</dt>
          <dd>{opportunity.countryEligibility.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-muted">Education</dt>
          <dd>{formatRequirementList(opportunity.educationRequirements)}</dd>
        </div>
      </dl>
      <h2 className="mt-10 font-display text-2xl">Requirements</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
        <li>{formatRequirementList(opportunity.educationRequirements)}</li>
        <li>{formatRequirementList(opportunity.fieldRequirements)}</li>
        <li>{formatRequirementList(opportunity.experienceRequirements)}</li>
        <li>{formatRequirementList(opportunity.languageRequirements)}</li>
        {opportunity.documentRequirements.map((doc) => (
          <li key={doc}>{doc}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => void analyze()}
          disabled={analyzing}
          className="min-h-11 bg-ink px-5 py-3 text-paper disabled:opacity-60"
        >
          {analyzing ? "Analyzing…" : "Analyze for me"}
        </button>
        <ExternalLink
          href={opportunity.applicationUrl}
          className="inline-flex min-h-11 items-center border border-ink px-5 py-3"
        >
          Official application
        </ExternalLink>
        <ExternalLink
          href={opportunity.sourceUrl}
          className="inline-flex min-h-11 items-center px-5 py-3 text-muted"
        >
          Official source
        </ExternalLink>
      </div>
      {error ? (
        <StatusPanel
          variant="error"
          title="We couldn't analyze this opportunity right now"
          primary={
            needsProfile
              ? { label: "Open profile", href: "/profile" }
              : { label: "Try again", onClick: () => void analyze() }
          }
        >
          {error}{" "}
          {needsProfile
            ? "Create or save a profile first."
            : "The decision engine did not finish. Try again."}
        </StatusPanel>
      ) : null}
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
