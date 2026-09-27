"use client";

import { FormEvent, useState } from "react";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";

type ResearchPaper = {
  id: string;
  extractedID: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfLink: string;
  doi: string | null;
  primaryCategory: string;
};

type ResearchSearch = {
  papers: ResearchPaper[];
  page: number;
  hasMore: boolean;
};

const PRESETS = [
  "Ethiopian university students scholarship application barriers",
  "communicating uncertainty in AI decision support",
  "voice interfaces for non-English speakers",
  "incomplete applications documents deadlines eligibility",
  "trust and verification of online opportunity postings",
];

export default function ResearchPage() {
  const [query, setQuery] = useState(PRESETS[0] ?? "");
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(nextQuery: string) {
    const value = nextQuery.trim();
    setQuery(value);
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const result = await api<ResearchSearch>(`/api/research/papers?q=${encodeURIComponent(value)}`);
      setPapers(result.papers);
    } catch (err: unknown) {
      setPapers([]);
      setError(userFacingError(err));
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <section>
      <h1 className="font-display text-4xl">Research</h1>
      <p className="mt-2 max-w-2xl text-muted">
        ScholarXIV papers inform HULUM’s design. They are not opportunity listings and they do not
        set APPLY, MAYBE, or SKIP.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" onSubmit={onSubmit}>
        <label className="grid min-w-[16rem] flex-1 gap-1 text-sm" htmlFor="research-query">
          Search papers
          <input
            id="research-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 border border-ink bg-surface px-3"
          />
        </label>
        <button type="submit" className="mt-6 inline-flex min-h-11 items-center bg-ink px-5 text-paper">
          Search ScholarXIV
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="border border-line px-3 py-2 text-left text-sm text-muted hover:text-ink"
            onClick={() => void runSearch(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      {loading ? (
        <StatusPanel variant="loading" title="Searching ScholarXIV">
          The server is calling the Papers API. Your browser never sees the API key.
        </StatusPanel>
      ) : null}

      {error ? (
        <StatusPanel variant="error" title="We couldn't search ScholarXIV" primary={{ label: "Try again", onClick: () => void runSearch(query) }}>
          {error} Put <code>SCHOLARXIV_API_KEY</code> in <code>apps/server/.env</code> and restart the API.
        </StatusPanel>
      ) : null}

      {!loading && !error && searched && papers.length === 0 ? (
        <StatusPanel variant="empty" title="No papers matched">
          ScholarXIV returned no rows for this query. That is a real empty result, not a HULUM listing.
        </StatusPanel>
      ) : null}

      {!loading && papers.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {papers.map((paper) => (
            <li key={paper.id} className="border border-line bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-muted">{paper.primaryCategory}</p>
              <h2 className="mt-1 font-display text-2xl">{paper.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {paper.authors.slice(0, 6).join(", ")}
                {paper.authors.length > 6 ? " et al." : ""}
              </p>
              <p className="mt-3 text-sm leading-6">{paper.summary.slice(0, 420)}{paper.summary.length > 420 ? "…" : ""}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a className="underline" href={paper.pdfLink} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
                {paper.doi ? (
                  <a className="underline" href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer">
                    DOI
                  </a>
                ) : null}
                <span className="text-muted">{paper.extractedID}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
