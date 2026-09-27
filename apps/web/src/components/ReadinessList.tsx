"use client";

import { useState } from "react";
import type { ReadinessItem, ReadinessStatus } from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { StatusPanel } from "@/components/StatusPanel";

const ORDER: ReadinessStatus[] = ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"];

const STATUS_LABELS: Record<ReadinessStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Ready",
  NOT_REQUIRED: "Not required",
};

const MARKS: Record<ReadinessStatus, string> = {
  TODO: "",
  IN_PROGRESS: "–",
  DONE: "✓",
  NOT_REQUIRED: "·",
};

export function ReadinessList({
  items,
  onChange,
}: {
  items: ReadinessItem[];
  onChange?: (item: ReadinessItem) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function cycle(item: ReadinessItem) {
    const next = ORDER[(ORDER.indexOf(item.status) + 1) % ORDER.length];
    setPendingId(item.id);
    setError(null);
    try {
      const updated = await api<ReadinessItem>(`/api/readiness/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      onChange?.(updated);
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-4">
          <StatusPanel variant="error" title="We couldn't update that checklist item">
            {error} Try the item again.
          </StatusPanel>
        </div>
      ) : null}
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => {
          const done = item.status === "DONE";
          const skipped = item.status === "NOT_REQUIRED";
          return (
            <li key={item.id} className="flex items-start gap-4 py-4">
              <button
                type="button"
                onClick={() => void cycle(item)}
                disabled={pendingId === item.id}
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center border text-sm transition-colors disabled:opacity-60 ${
                  done
                    ? "border-apply bg-apply-soft text-apply"
                    : "border-line-strong text-ink hover:border-ink"
                }`}
                aria-label={`${item.title}, ${STATUS_LABELS[item.status]}. Activate to change status.`}
              >
                <span aria-hidden>{MARKS[item.status]}</span>
              </button>
              <div className="min-w-0 pt-1">
                <p className={`leading-6 ${skipped ? "text-muted line-through" : ""}`}>
                  {item.title}
                </p>
                {item.description ? (
                  <p className="text-sm leading-6 text-muted">{item.description}</p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                  {STATUS_LABELS[item.status]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
