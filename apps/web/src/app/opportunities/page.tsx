"use client";

import { useEffect, useState } from "react";
import { OPPORTUNITY_TYPES, TYPE_LABELS, type Opportunity, type OpportunityType } from "@hulum/shared";
import { OpportunityCard } from "@/components/OpportunityCard";
import { api } from "@/lib/api";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [type, setType] = useState<OpportunityType | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = type ? `?type=${type}` : "";
    void api<Opportunity[]>(`/api/opportunities${query}`)
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, [type]);

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
      {error ? <p className="mt-6 text-skip">{error}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </section>
  );
}
