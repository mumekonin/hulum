"use client";

import type { ReadinessItem, ReadinessStatus } from "@hulum/shared";
import { api } from "@/lib/api";

export function ReadinessList({
  items,
  onChange,
}: {
  items: ReadinessItem[];
  onChange?: (item: ReadinessItem) => void;
}) {
  async function cycle(item: ReadinessItem) {
    const order: ReadinessStatus[] = ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    const updated = await api<ReadinessItem>(`/api/readiness/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next }),
    });
    onChange?.(updated);
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 border border-line bg-white/60 p-4">
          <button
            type="button"
            onClick={() => void cycle(item)}
            className="mt-1 h-5 w-5 shrink-0 border border-ink"
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
  );
}
