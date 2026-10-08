"use client";

import { useEffect, useState } from "react";
import { userFacingError } from "@/lib/api";
import { btnSecondary } from "@/lib/ui";
import { fetchSaved, saveOpportunity, unsaveOpportunity } from "@/lib/history";

export function SaveOpportunityButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchSaved()
      .then((rows) => {
        if (!cancelled) setSaved(rows.some((row) => row.opportunityId === opportunityId));
      })
      .catch(() => {
        if (!cancelled) setSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  async function toggle() {
    if (saved === null) return;
    setBusy(true);
    setError(null);
    try {
      if (saved) {
        await unsaveOpportunity(opportunityId);
        setSaved(false);
      } else {
        await saveOpportunity(opportunityId);
        setSaved(true);
      }
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={saved === null || busy}
        aria-pressed={saved === true}
        className={`w-full ${btnSecondary}`}
      >
        {saved ? "Saved · Remove" : "Save opportunity"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-skip">
          {error}
        </p>
      ) : null}
    </div>
  );
}
