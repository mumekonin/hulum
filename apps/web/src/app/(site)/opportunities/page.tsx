"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  OPPORTUNITY_TYPES,
  TYPE_LABELS,
  type Decision,
  type Opportunity,
  type OpportunityType,
} from "@hulum/shared";
import { OpportunityRow, OpportunitySuggestionCard } from "@/components/OpportunityRow";
import { useSiteProfile } from "@/components/RequireProfile";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";
import {
  discover,
  EMPTY_FILTERS,
  filterOptions,
  type DeadlineWindow,
  type DiscoverFilters,
  type ExperienceFilter,
  type FilterOption,
} from "@/lib/discover";
import { DISCOVER_CONTEXT_LIMIT, writeDiscoverContext } from "@/lib/discover-context";
import {
  buildSearchSuggestions,
  suggestOpportunities,
  suggestionBasis,
  suggestionFiltersActive,
  type SearchSuggestion,
} from "@/lib/discover-suggestions";
import {
  DECISION_FILTER_OPTIONS,
  decisionsById,
  fetchMyAnalyses,
  matchesDecision,
  sortByStoredDecision,
  type DecisionFilter,
} from "@/lib/history";

const DEADLINE_OPTIONS: Array<{ value: DeadlineWindow; label: string }> = [
  { value: "any", label: "Any deadline" },
  { value: "7", label: "Within 7 days" },
  { value: "30", label: "Within 30 days" },
  { value: "90", label: "Within 90 days" },
];

function groupedOptions(options: FilterOption[]) {
  const ungrouped: FilterOption[] = [];
  const groups: Array<{ label: string; options: FilterOption[] }> = [];
  const index = new Map<string, number>();
  for (const option of options) {
    if (option.group === undefined) {
      ungrouped.push(option);
      continue;
    }
    const existing = index.get(option.group);
    if (existing === undefined) {
      index.set(option.group, groups.length);
      groups.push({ label: option.group, options: [option] });
    } else {
      groups[existing].options.push(option);
    }
  }
  return { ungrouped, groups };
}

function FilterSelectOptions({
  options,
  emptyLabel,
}: {
  options: FilterOption[];
  emptyLabel?: string;
}) {
  const { ungrouped, groups } = groupedOptions(options);
  return (
    <>
      {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
      {ungrouped.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

function isOpportunityType(value: string | null): value is OpportunityType {
  return OPPORTUNITY_TYPES.some((type) => type === value);
}

function pluralType(type: OpportunityType): string {
  return `${TYPE_LABELS[type]}s`;
}

const selectClass =
  "min-h-11 w-full border border-line bg-surface px-3 text-sm normal-case tracking-normal text-ink";

export default function DiscoverPage() {
  const [all, setAll] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [decisions, setDecisions] = useState<Map<string, Decision> | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("");
  const siteProfile = useSiteProfile();
  const profile = siteProfile?.profile ?? null;

  useEffect(() => {
    let cancelled = false;
    void fetchMyAnalyses()
      .then((rows) => {
        if (!cancelled) setDecisions(decisionsById(rows));
      })
      .catch(() => {
        if (!cancelled) setDecisions(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim() ?? "";
    const type = params.get("type");
    if (q !== "") {
      setQueryInput(q);
      setQuery(q);
    }
    if (isOpportunityType(type)) setFilters((current) => ({ ...current, type }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    void api<Opportunity[]>("/api/opportunities")
      .then((data) => {
        if (cancelled) return;
        setAll(data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setAll([]);
        setError(userFacingError(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const result = useMemo(() => {
    const found = discover(all, query, filters);
    const filtered =
      decisions === null || decisionFilter === ""
        ? found.items
        : found.items.filter((item) => matchesDecision(item.id, decisionFilter, decisions));
    return {
      ...found,
      items: sortByStoredDecision(filtered, decisions),
    };
  }, [all, query, filters, decisions, decisionFilter]);
  const sortedByStoredDecisions = decisions !== null && decisions.size > 0;
  const options = useMemo(() => filterOptions(all), [all]);
  const searchSuggestions = useMemo(() => buildSearchSuggestions(all, profile), [all, profile]);
  const suggestedListings = useMemo(() => suggestOpportunities(all, profile, 3), [all, profile]);
  const suggestionFacts = useMemo(() => suggestionBasis(profile), [profile]);

  useEffect(() => {
    if (status !== "ready") return;
    writeDiscoverContext({
      query,
      items: result.items.slice(0, DISCOVER_CONTEXT_LIMIT).map(({ id, title }) => ({ id, title })),
      total: result.items.length,
    });
  }, [status, query, result]);
  const activeFilterCount = [
    filters.deadline !== "any",
    filters.location !== "",
    filters.field !== "",
    filters.education !== "",
    filters.experience !== "any",
    filters.includeClosed,
    decisionFilter !== "",
  ].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;
  const showDecisionFilter = decisions !== null && decisions.size > 0;
  const showSuggestedListings =
    status === "ready" &&
    query === "" &&
    !filtersActive &&
    filters.type === "" &&
    suggestedListings.length > 0;

  function update<K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setQuery(queryInput.trim());
  }

  function applySuggestion(suggestion: SearchSuggestion) {
    if (suggestionFiltersActive(filters, suggestion) && query === suggestion.query) {
      setQueryInput("");
      setQuery("");
      setFilters((current) => ({ ...EMPTY_FILTERS, type: current.type }));
      return;
    }
    setQueryInput(suggestion.query);
    setQuery(suggestion.query);
    setFilters({ ...EMPTY_FILTERS, ...suggestion.filters });
    setDecisionFilter("");
  }

  function clearSearch() {
    setQueryInput("");
    setQuery("");
  }

  function clearFilters() {
    setFilters((current) => ({ ...EMPTY_FILTERS, type: current.type }));
    setDecisionFilter("");
  }

  const count = result.items.length;
  const resultLabel = `${count} ${count === 1 ? "opportunity" : "opportunities"}`;
  const emptyMatchBody =
    filters.type === "job" && query === ""
      ? "There are no jobs in the catalog yet. Clear the Jobs chip to see scholarships and internships already saved. Afriwork jobs appear after the investigator reads Explore jobs pages that still show a deadline."
      : "Nothing in the stored catalog matches this search and these filters.";

  return (
    <section>
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Find opportunities worth your time.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Discover opportunities, understand your fit, and know what to prepare.
        </p>
      </header>

      <form role="search" onSubmit={submitSearch} className="mt-10">
        <label htmlFor="opportunity-search" className="sr-only">
          Search opportunities
        </label>
        <div className="flex border border-line-strong bg-surface focus-within:border-ink">
          <input
            id="opportunity-search"
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search scholarships, fellowships, internships, jobs…"
            className="min-h-14 w-full min-w-0 bg-transparent px-5 text-lg placeholder:text-muted focus:outline-none"
            aria-controls="opportunity-results"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 px-5 text-sm font-medium text-ink hover:underline"
          >
            Search
          </button>
        </div>
        {searchSuggestions.length > 0 ? (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Suggested searches</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Suggested searches">
              {searchSuggestions.map((suggestion) => {
                const active =
                  suggestionFiltersActive(filters, suggestion) && query === suggestion.query;
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applySuggestion(suggestion)}
                    className={`min-h-11 border px-4 text-sm transition-colors ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-line text-ink hover:border-line-strong"
                    }`}
                  >
                    {suggestion.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </form>

      <div
        className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label="Opportunity type"
      >
        {(["", ...OPPORTUNITY_TYPES] as const).map((type) => {
          const active = filters.type === type;
          return (
            <button
              key={type || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => update("type", type)}
              className={`min-h-11 shrink-0 border px-4 text-sm transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {type === "" ? "All" : pluralType(type)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="discover-filters"
        className="mt-6 inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 text-sm sm:hidden"
      >
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        <span aria-hidden>{filtersOpen ? "−" : "+"}</span>
      </button>

      <fieldset
        id="discover-filters"
        className={`mt-6 border-0 p-0 ${filtersOpen ? "" : "hidden sm:block"}`}
      >
        <legend className="sr-only">Filters</legend>
        <div
          className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${
            showDecisionFilter ? "xl:grid-cols-6" : "lg:grid-cols-5"
          }`}
        >
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
            Deadline
            <select
              value={filters.deadline}
              onChange={(e) => update("deadline", e.target.value as DeadlineWindow)}
              className={selectClass}
            >
              {DEADLINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
            Location
            <select
              value={filters.location}
              onChange={(e) => update("location", e.target.value)}
              className={selectClass}
            >
              <option value="">Any location</option>
              {options.locations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
            Field
            <select
              value={filters.field}
              onChange={(e) => update("field", e.target.value)}
              className={selectClass}
            >
              <FilterSelectOptions options={options.fields} emptyLabel="Any field" />
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
            Education
            <select
              value={filters.education}
              onChange={(e) => update("education", e.target.value)}
              className={selectClass}
            >
              <FilterSelectOptions options={options.education} emptyLabel="Any education" />
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
            Experience
            <select
              value={filters.experience}
              onChange={(e) => update("experience", e.target.value as ExperienceFilter)}
              className={selectClass}
            >
              <FilterSelectOptions options={options.experience} />
            </select>
          </label>
          {showDecisionFilter ? (
            <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-muted">
              Your decision
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value as DecisionFilter)}
                className={selectClass}
              >
                {DECISION_FILTER_OPTIONS.map((option) => (
                  <option key={option.value || "any"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex min-h-11 items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={filters.includeClosed}
              onChange={(e) => update("includeClosed", e.target.checked)}
              className="h-4 w-4 accent-current"
            />
            Include closed deadlines
          </label>
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-11 text-muted underline underline-offset-4 hover:text-ink"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </fieldset>

      {status === "loading" ? (
        <StatusPanel variant="loading" title="Loading opportunities">
          Reading the stored, sourced catalog
          {query ? ` for “${query}”` : ""}
          {filters.type ? ` in ${TYPE_LABELS[filters.type]}` : ""}.
        </StatusPanel>
      ) : null}

      {status === "error" ? (
        <StatusPanel
          variant="error"
          title="We couldn't load opportunities"
          primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
        >
          {error}
        </StatusPanel>
      ) : null}

      {status === "ready" && all.length === 0 ? (
        <StatusPanel
          variant="empty"
          title="No opportunities yet"
          primary={{ label: "Analyze a screenshot", href: "/screenshot" }}
          secondary={{ label: "Complete your profile", href: "/profile" }}
        >
          HULUM only shows stored opportunities with an official source. It never invents listings.
          If you saw a post on Telegram or LinkedIn, upload a screenshot and HULUM will read it.
        </StatusPanel>
      ) : null}

      {status === "ready" && all.length > 0 ? (
        <div className="mt-10">
          {showSuggestedListings ? (
            <section className="mb-12" aria-labelledby="suggested-opportunities-heading">
              <div className="border-b border-line pb-3">
                <h2
                  id="suggested-opportunities-heading"
                  className="font-display text-2xl leading-snug"
                >
                  Suggested for you
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {suggestionFacts.length > 0
                    ? `From your profile · ${suggestionFacts.join(" · ")}.`
                    : "From the stored catalog."}{" "}
                  This is a filter, not a HULUM APPLY / MAYBE / SKIP decision. Analyze a listing to
                  see your fit.
                </p>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suggestedListings.map((opportunity) => (
                  <li key={opportunity.id}>
                    <OpportunitySuggestionCard opportunity={opportunity} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3"
            aria-live="polite"
          >
            <p className="text-sm text-ink">
              {resultLabel}
              {result.inferredType ? (
                <span className="text-muted">
                  {" "}
                  · {pluralType(result.inferredType).toLowerCase()} from your search
                </span>
              ) : null}
              {sortedByStoredDecisions ? (
                <span className="text-muted"> · Sorted by your stored HULUM decisions</span>
              ) : null}
            </p>
            {result.ignoredTerms.length > 0 ? (
              <p className="text-sm text-muted">
                No listing mentions {result.ignoredTerms.map((term) => `“${term}”`).join(", ")}, so{" "}
                {result.ignoredTerms.length === 1 ? "it was" : "they were"} ignored.
              </p>
            ) : null}
            {count > 0 ? (
              <Link
                href="/assistant?from=discover"
                className="text-sm text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
              >
                Which of these should I apply for?
              </Link>
            ) : null}
          </div>

          {count === 0 ? (
            <StatusPanel
              variant="empty"
              title="No matches"
              primary={
                query
                  ? { label: "Clear search", onClick: clearSearch }
                  : { label: "Clear filters", onClick: clearFilters }
              }
              secondary={
                query && (filtersActive || filters.type !== "")
                  ? {
                      label: "Show all types and filters",
                      onClick: () => {
                        setFilters(EMPTY_FILTERS);
                        setDecisionFilter("");
                      },
                    }
                  : undefined
              }
            >
              {emptyMatchBody}
            </StatusPanel>
          ) : (
            <ul id="opportunity-results" className="divide-y divide-line">
              {result.items.map((opportunity) => (
                <li key={opportunity.id}>
                  <OpportunityRow
                    opportunity={opportunity}
                    decision={decisions?.get(opportunity.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
            Saw an opportunity on Telegram or LinkedIn?{" "}
            <Link href="/screenshot" className="text-ink underline underline-offset-4">
              Analyze a screenshot
            </Link>
            .
          </p>
        </div>
      ) : null}
    </section>
  );
}
