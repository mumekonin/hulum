"use client";

import { useState } from "react";
import type { ReadinessItem, ReadinessStatus } from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { StatusPanel } from "@/components/StatusPanel";

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
    const order: ReadinessStatus[] = ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
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
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 border border-line bg-white/60 p-4">
            <button
              type="button"
              onClick={() => void cycle(item)}
              disabled={pendingId === item.id}
              className="mt-1 h-5 w-5 shrink-0 border border-ink disabled:opacity-60"
              aria-label={`Mark ${item.title} ${item.status}`}
            >
              <span className="block text-center text-xs">{item.status === "DONE" ? "✓" : item.status === "IN_PROGRESS" ? "•" : ""}</span>
            </button>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">{item.description}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                {item.status.replace("_", " ")} · {item.priority}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
