"use client";

import { useEffect, useState } from "react";
import { OPPORTUNITY_TYPES, TYPE_LABELS, type Opportunity, type OpportunityType } from "@hulum/shared";
import { OpportunityCard } from "@/components/OpportunityCard";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [type, setType] = useState<OpportunityType | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const query = type ? `?type=${type}` : "";
    void api<Opportunity[]>(`/api/opportunities${query}`)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(userFacingError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, reloadKey]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Opportunities</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Curated records with official sources. HULUM does not scrape unverified Telegram posts in v0.1.
          </p>
        </div>
        <label className="text-sm">
          Filter
          <select value={type} onChange={(e) => setType(e.target.value as OpportunityType | "")} className="ml-2 border border-line bg-white px-3 py-2">
            <option value="">All types</option>
            {OPPORTUNITY_TYPES.map((value) => (
              <option key={value} value={value}>
                {TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <StatusPanel variant="loading" title="Loading opportunities">
          Checking the curated list{type ? ` for ${TYPE_LABELS[type]}` : ""}.
        </StatusPanel>
      ) : null}
      {!loading && error ? (
        <StatusPanel
          variant="error"
          title="We couldn't load opportunities"
          primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        >
          {error}
        </StatusPanel>
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <StatusPanel
          variant="empty"
          title={type ? `No ${TYPE_LABELS[type].toLowerCase()} records` : "No opportunities yet"}
          primary={type ? { label: "Clear filter", onClick: () => setType("") } : { label: "Create a profile", href: "/profile" }}
        >
          {type
            ? "Nothing in the current list matches this filter. Clear it to see every curated record."
            : "HULUM only shows stored, sourced opportunities. Create a profile so you are ready when records are available."}
        </StatusPanel>
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
