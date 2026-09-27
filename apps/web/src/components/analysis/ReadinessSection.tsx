import Link from "next/link";
import type { ReadinessItem } from "@hulum/shared";
import { ReadinessList } from "@/components/ReadinessList";

export function ReadinessSection({
  items,
  askHref,
  onChange,
}: {
  items: ReadinessItem[];
  askHref: string;
  onChange: (item: ReadinessItem) => void;
}) {
  const required = items.filter((item) => item.status !== "NOT_REQUIRED");
  const ready = required.filter((item) => item.status === "DONE").length;
  const total = required.length;
  const percent = total === 0 ? 0 : Math.round((ready / total) * 100);

  return (
    <section aria-labelledby="readiness-heading" className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="readiness-heading" className="font-display text-2xl">
          Readiness
        </h2>
        {total > 0 ? (
          <p className="text-sm text-muted">
            <span className="text-ink">
              {ready} / {total}
            </span>{" "}
            ready
          </p>
        ) : null}
      </div>
      {total > 0 ? (
        <div
          className="mt-3 h-1 w-full bg-surface-muted"
          role="progressbar"
          aria-label="Readiness progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={ready}
        >
          <div
            className="h-1 bg-ink transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
      <p className="mt-4 text-sm text-muted">
        Mark each item as you prepare it. Your progress is saved.
      </p>
      <div className="mt-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted">This analysis did not create a checklist.</p>
        ) : (
          <ReadinessList items={items} onChange={onChange} />
        )}
      </div>
      <Link
        href={askHref}
        className="mt-5 inline-flex min-h-11 items-center text-sm underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        What should I prepare? Ask HULUM
      </Link>
    </section>
  );
}
