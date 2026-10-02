"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Analysis } from "@hulum/shared";
import { StatusPanel } from "@/components/StatusPanel";
import { api, isNotFound, userFacingError } from "@/lib/api";

/** Stored analyses are shown on their opportunity page; this route keeps older links working. */
export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setMissing(false);
    void api<Analysis>(`/api/analyses/${params.id}`)
      .then((analysis) => {
        if (!cancelled)
          router.replace(`/opportunities/${analysis.opportunityId}?analysisId=${analysis.id}`);
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
  }, [params.id, reloadKey, router]);

  if (error) {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load this analysis"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        secondary={{ label: "Back to Discover", href: "/opportunities" }}
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
        primary={{ label: "Back to Discover", href: "/opportunities" }}
      >
        Open an opportunity and analyze it again.
      </StatusPanel>
    );
  }

  return (
    <StatusPanel variant="loading" title="Opening your analysis">
      Loading APPLY / MAYBE / SKIP, requirements, and readiness.
    </StatusPanel>
  );
}
