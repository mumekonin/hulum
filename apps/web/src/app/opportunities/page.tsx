"use client";

import { useEffect, useState } from "react";
import { OPPORTUNITY_TYPES, TYPE_LABELS, type Opportunity, type OpportunityType } from "@hulum/shared";
import { OpportunityCard } from "@/components/OpportunityCard";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [type, setType] = useState<OpportunityType | "">("");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (query) params.set("q", query);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    void api<Opportunity[]>(`/api/opportunities${suffix}`)
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
  }, [type, query, reloadKey]);

  function clearSearch() {
    setQueryInput("");
    setQuery("");
  }

  const emptyTitle = query
    ? `No matches for “${query}”`
    : type
      ? `No ${TYPE_LABELS[type].toLowerCase()} records`
      : "No opportunities yet";
  const emptyBody = query
    ? "Nothing in the curated list matches that search. Try another word, or clear search to see every record."
    : type
      ? "Nothing in the current list matches this filter. Clear it to see every curated record."
      : "HULUM only shows stored, sourced opportunities. Create a profile so you are ready when records are available.";

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Opportunities</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Curated records with official sources. HULUM does not scrape unverified Telegram posts in v0.1.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm" htmlFor="opportunity-search">
            Search
            <input
              id="opportunity-search"
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="A2SV, Chevening, internship…"
              className="block min-h-11 w-56 border border-line bg-white px-3 py-2"
              aria-controls="opportunity-results"
            />
          </label>
          <label className="grid gap-1 text-sm" htmlFor="opportunity-type">
            Filter
            <select
              id="opportunity-type"
              value={type}
              onChange={(e) => setType(e.target.value as OpportunityType | "")}
              className="min-h-11 border border-line bg-white px-3 py-2"
            >
              <option value="">All types</option>
              {OPPORTUNITY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {loading ? (
        <StatusPanel variant="loading" title="Loading opportunities">
          Checking the curated list{query ? ` for “${query}”` : ""}
          {type ? ` in ${TYPE_LABELS[type]}` : ""}.
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
          title={emptyTitle}
          primary={
            query
              ? { label: "Clear search", onClick: clearSearch }
              : type
                ? { label: "Clear filter", onClick: () => setType("") }
                : { label: "Create a profile", href: "/profile" }
          }
          secondary={query && type ? { label: "Clear filter", onClick: () => setType("") } : undefined}
        >
          {emptyBody}
        </StatusPanel>
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <ul id="opportunity-results" className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((opportunity) => (
            <li key={opportunity.id}>
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      ) : (
        <div id="opportunity-results" className="sr-only" aria-live="polite">
          {loading ? "Loading opportunities" : error ? "Could not load opportunities" : emptyTitle}
        </div>
      )}
    </section>
  );
}
