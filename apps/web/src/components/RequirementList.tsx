import type { RequirementStatus } from "@hulum/shared";

const labels: Record<RequirementStatus, string> = {
  MET: "Matched",
  NOT_MET: "Not met",
  UNCERTAIN: "Needs attention",
  NOT_APPLICABLE: "Not applicable",
};

const marks: Record<RequirementStatus, string> = {
  MET: "✓",
  NOT_MET: "✕",
  UNCERTAIN: "!",
  NOT_APPLICABLE: "–",
};

const borders: Record<RequirementStatus, string> = {
  MET: "border-l-apply",
  NOT_MET: "border-l-skip",
  UNCERTAIN: "border-l-maybe",
  NOT_APPLICABLE: "border-l-line",
};

function explanationFor(item: {
  status: RequirementStatus;
  reason?: string | null;
}): string {
  const reason = item.reason?.trim();
  if (reason) {
    return reason;
  }
  return "No stored explanation for this requirement. Confirm against the official source.";
}

export function RequirementList({
  items,
}: {
  items: Array<{
    id?: string;
    key: string;
    requirementText?: string;
    text?: string;
    status: RequirementStatus;
    evidence?: string | null;
    reason?: string | null;
  }>;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const evidence = item.evidence?.trim();
        return (
          <li
            key={item.id ?? item.key}
            className={`border border-line border-l-4 bg-surface p-4 ${borders[item.status]}`}
          >
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="font-display text-xl">
                {marks[item.status]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {item.requirementText?.trim() || item.text?.trim() || item.key}
                </p>
                <p className="mt-1 text-sm text-muted">{labels[item.status]}</p>
                <p className="mt-2 text-sm leading-6">
                  <span className="font-medium">Why. </span>
                  {explanationFor(item)}
                </p>
                {evidence ? (
                  <p className="mt-2 text-sm text-muted">
                    <span className="font-medium text-ink">Evidence. </span>
                    {evidence}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
