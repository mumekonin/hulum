"use client";

import { useState } from "react";
import { FAQ, FAQ_PRIMARY_COUNT, type FaqEntry } from "@/lib/faq";
import type { RecentQuestion } from "@/lib/recent-questions";

const itemClass =
  "block min-h-11 w-full py-2.5 text-left text-sm leading-6 text-ink underline-offset-4 hover:underline disabled:opacity-60";

export function RecentQuestions({
  items,
  onSelect,
  disabled,
}: {
  items: RecentQuestion[];
  onSelect: (item: RecentQuestion) => void;
  disabled: boolean;
}) {
  return (
    <section aria-labelledby="recent-heading">
      <h2
        id="recent-heading"
        className="text-xs font-medium uppercase tracking-[0.14em] text-muted"
      >
        Recent questions
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          Your questions will appear here. They stay in this browser.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {items.map((item) => (
            <li key={`${item.askedAt}-${item.text}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(item)}
                className={itemClass}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FrequentlyAsked({
  onSelect,
  disabled,
}: {
  onSelect: (entry: FaqEntry) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? FAQ : FAQ.slice(0, FAQ_PRIMARY_COUNT);
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Frequently asked
      </h2>
      <ul id="faq-list" className="mt-2 divide-y divide-line">
        {shown.map((entry) => (
          <li key={entry.question}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(entry)}
              className={itemClass}
            >
              {entry.question}
            </button>
          </li>
        ))}
      </ul>
      {FAQ.length > FAQ_PRIMARY_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls="faq-list"
          className="mt-2 min-h-11 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          {expanded ? "Fewer questions" : `More questions (${FAQ.length - FAQ_PRIMARY_COUNT})`}
        </button>
      ) : null}
    </section>
  );
}
