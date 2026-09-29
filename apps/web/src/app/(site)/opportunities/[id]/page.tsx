"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TYPE_LABELS, type Analysis, type Opportunity, type ReadinessItem } from "@hulum/shared";
import { DecisionAuditPanel } from "@/components/DecisionAuditPanel";
import { StatusPanel } from "@/components/StatusPanel";
import { DecisionSection } from "@/components/analysis/DecisionSection";
import { OfficialSourcePanel } from "@/components/analysis/OfficialSourcePanel";
import { ReadinessSection } from "@/components/analysis/ReadinessSection";
import { api, isNotFound, userFacingError } from "@/lib/api";
import { daysUntil, formatDeadline, requirementLines } from "@/lib/format";
import { getUserId } from "@/lib/storage";
import { readVoiceSession, writeVoiceSession } from "@/lib/voice-session";

const REQUIREMENT_GROUPS: Array<{ label: string; pick: (item: Opportunity) => string[] }> = [
  { label: "Education", pick: (item) => requirementLines(item.educationRequirements) },
  { label: "Field", pick: (item) => requirementLines(item.fieldRequirements) },
  { label: "Experience", pick: (item) => requirementLines(item.experienceRequirements) },
  { label: "Language", pick: (item) => requirementLines(item.languageRequirements) },
  { label: "Documents", pick: (item) => item.documentRequirements },
  { label: "Other", pick: (item) => item.otherRequirements },
];

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const decisionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setMissing(false);
    setOpportunity(null);
    void api<Opportunity>(`/api/opportunities/${params.id}`)
      .then((data) => {
        if (cancelled) return;
        setOpportunity(data);
        document.title = `${data.title} · HULUM`;
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

  // Reopen a stored analysis for this opportunity (from a link or this browser session).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("analysisId");
    const session = readVoiceSession();
    const candidate =
      fromUrl ?? (session.opportunityId === params.id ? session.analysisId : undefined);
    if (!candidate) return;
    let cancelled = false;
    void api<Analysis>(`/api/analyses/${candidate}`)
      .then((stored) => {
        if (!cancelled && stored.opportunityId === params.id) setAnalysis(stored);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function analyze() {
    const userId = getUserId();
    if (!userId) {
      router.push("/profile");
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await api<Analysis>(`/api/opportunities/${params.id}/analyze`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      setAnalysis(result);
      writeVoiceSession({ opportunityId: result.opportunityId, analysisId: result.id });
      window.history.replaceState(null, "", `?analysisId=${result.id}`);
      window.requestAnimationFrame(() => decisionRef.current?.focus());
    } catch (err) {
      setAnalyzeError(userFacingError(err));
    } finally {
      setAnalyzing(false);
    }
  }

  function replaceReadiness(item: ReadinessItem) {
    setAnalysis((current) =>
      current
        ? {
            ...current,
            readiness: (current.readiness ?? []).map((row) => (row.id === item.id ? item : row)),
          }
        : current,
    );
  }

  if (loadError) {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load this opportunity"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        secondary={{ label: "Back to Discover", href: "/opportunities" }}
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
        primary={{ label: "Back to Discover", href: "/opportunities" }}
      >
        It may have been removed from the stored records.
      </StatusPanel>
    );
  }

  if (!opportunity) {
    return (
      <StatusPanel variant="loading" title="Loading opportunity">
        Fetching the official source, deadline, and requirements.
      </StatusPanel>
    );
  }

  const remaining = daysUntil(opportunity.deadline);
  const closed = remaining !== null && remaining < 0;
  const needsProfile = analyzeError?.toLowerCase().includes("profile") ?? false;
  const requirementGroups = REQUIREMENT_GROUPS.map((group) => ({
    label: group.label,
    lines: group.pick(opportunity),
  })).filter((group) => group.lines.length > 0);
  const askHref = `/assistant?opportunityId=${opportunity.id}${analysis ? `&analysisId=${analysis.id}` : ""}`;

  return (
    <article>
      <Link
        href="/opportunities"
        className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
      >
        ??? Discover
      </Link>

      <header className="mt-4 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {TYPE_LABELS[opportunity.type]}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          {opportunity.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{opportunity.organization}</p>
        <p className={`mt-4 text-sm ${closed ? "text-skip" : "text-ink"}`}>
          <span className="text-muted">Deadline ?? </span>
          {formatDeadline(opportunity.deadline)}
          {closed
            ? " ?? Closed"
            : remaining !== null
              ? ` ?? ${remaining} ${remaining === 1 ? "day" : "days"} left`
              : ""}
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div ref={decisionRef} tabIndex={-1} className="focus:outline-none">
            {analysis ? (
              <>
                <DecisionSection analysis={analysis} />
                <ReadinessSection
                  items={analysis.readiness ?? []}
                  askHref={askHref}
                  onChange={replaceReadiness}
                />
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => void analyze()}
                    disabled={analyzing}
                    className="min-h-11 text-muted underline underline-offset-4 hover:text-ink disabled:opacity-60"
                  >
                    {analyzing ? "Analyzing???" : "Analyze again with my latest profile"}
                  </button>
                  <Link
                    href={askHref}
                    className="inline-flex min-h-11 items-center text-muted underline underline-offset-4 hover:text-ink"
                  >
                    Why this decision? Ask HULUM
                  </Link>
                </div>
                {analysis.audit ? <DecisionAuditPanel audit={analysis.audit} /> : null}
              </>
            ) : (
              <section
                className="border border-line bg-surface p-6"
                aria-labelledby="analyze-heading"
              >
                <h2 id="analyze-heading" className="font-display text-2xl">
                  Should you apply?
                </h2>
                <p className="mt-2 max-w-xl leading-7 text-muted">
                  HULUM compares your saved profile with this listing&apos;s requirements and
                  returns APPLY, MAYBE, or SKIP, with the reasons and what to prepare.
                </p>
                <button
                  type="button"
                  onClick={() => void analyze()}
                  disabled={analyzing}
                  className="mt-5 inline-flex min-h-11 items-center bg-ink px-5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {analyzing ? "Analyzing your fit???" : "Analyze my fit"}
                </button>
              </section>
            )}
          </div>

          {analyzeError ? (
            <StatusPanel
              variant="error"
              title={
                needsProfile
                  ? "Complete your profile first"
                  : "We couldn't analyze this opportunity"
              }
              primary={
                needsProfile
                  ? { label: "Open profile", href: "/profile" }
                  : { label: "Try again", onClick: () => void analyze() }
              }
            >
              {needsProfile
                ? "HULUM needs your saved profile to compare against this listing."
                : `${analyzeError} The decision engine did not finish.`}
            </StatusPanel>
          ) : null}

          <section className="mt-14" aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-2xl">
              About this opportunity
            </h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line leading-8">
              {opportunity.description}
            </p>
          </section>

          <section className="mt-12" aria-labelledby="requirements-heading">
            <h2 id="requirements-heading" className="font-display text-2xl">
              Requirements
            </h2>
            <p className="mt-2 text-sm text-muted">As stored from the official source.</p>
            {requirementGroups.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No structured requirements were stored for this listing. Confirm eligibility on the
                official source.
              </p>
            ) : (
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {requirementGroups.map((group) => (
                  <div
                    key={group.label}
                    className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                  >
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted sm:pt-1">
                      {group.label}
                    </dt>
                    <dd>
                      <ul className="space-y-1 leading-7">
                        {group.lines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Eligible countries</dt>
              <dd className="mt-1">
                {opportunity.countryEligibility.length > 0
                  ? opportunity.countryEligibility.join(", ")
                  : "Not listed"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Source status</dt>
              <dd className="mt-1">
                {opportunity.verificationStatus === "VERIFIED"
                  ? "Verified source"
                  : opportunity.verificationStatus === "AI_EXTRACTED"
                    ? "AI-extracted, not yet verified"
                    : opportunity.verificationStatus === "EXPIRED"
                      ? "Expired"
                      : "Source needs review"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">Last verified</dt>
              <dd className="mt-1">
                {opportunity.lastVerifiedAt
                  ? formatDeadline(opportunity.lastVerifiedAt.slice(0, 10))
                  : "Not recorded"}
              </dd>
            </div>
          </dl>
          <OfficialSourcePanel opportunity={opportunity} />
          <Link
            href={askHref}
            className="flex min-h-11 items-center justify-center border border-line-strong px-4 text-sm hover:border-ink"
          >
            Ask HULUM about this
          </Link>
        </aside>
      </div>
    </article>
  );
}
