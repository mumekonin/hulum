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
      {items.map((item) => (
        <li key={item.id ?? item.key} className={`border border-line border-l-4 bg-white/60 p-4 ${borders[item.status]}`}>
          <p className="flex items-start gap-3">
            <span aria-hidden="true" className="font-display text-xl">
              {marks[item.status]}
            </span>
            <span>
              <span className="block font-medium">{item.requirementText ?? item.text ?? item.key}</span>
              <span className="mt-1 block text-sm text-muted">
                {labels[item.status]}. {item.reason ?? ""}
              </span>
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
