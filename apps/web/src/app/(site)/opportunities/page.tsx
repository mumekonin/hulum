"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    void api<Opportunity[]>("/api/opportunities")
      .then((data) => {
        if (cancelled) return;
        const needle = query.toLowerCase();
        setItems(
          data.filter((item) => {
            if (type && item.type !== type) return false;
            if (!needle) return true;
            const blob = `${item.title} ${item.organization} ${item.description}`.toLowerCase();
            return blob.includes(needle);
          }),
        );
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
    ? "Nothing in the catalog matches that search. Try another word, or clear search to see every record."
    : type
      ? type === "job"
        ? "There are no jobs in the catalog yet. Clear the filter to see scholarships and internships already saved. Afriwork jobs appear after the investigator reads Explore jobs pages that still show a deadline."
        : "Nothing in the current list matches this filter. Clear it to see every saved record."
      : "HULUM only shows stored, sourced opportunities. Create a profile so you are ready when records are available.";

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Opportunities</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Catalog records with official sources. If you saw a post on Telegram or LinkedIn,{" "}
            <Link href="/screenshot" className="underline">
              upload a screenshot
            </Link>{" "}
            — HULUM reads the photo and analyzes it. It does not invent a deadline or apply link.
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
          Checking the catalog{query ? ` for “${query}”` : ""}
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
