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

export function RequirementList({
  items,
}: {
  items: Array<{
    key: string;
    requirementText: string;
    status: RequirementStatus;
    evidence: string;
    reason: string;
  }>;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key} className="border border-line bg-white/60 p-4">
          <p className="flex items-start gap-3">
            <span aria-hidden="true" className="font-display text-xl">
              {marks[item.status]}
            </span>
            <span>
              <span className="block font-medium">{item.requirementText}</span>
              <span className="mt-1 block text-sm text-muted">
                {labels[item.status]}. {item.reason}
              </span>
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
