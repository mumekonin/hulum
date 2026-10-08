import type { Decision } from "@hulum/shared";

const styles: Record<Decision, string> = {
  APPLY: "border-apply/40 bg-apply-soft text-apply decision-touch decision-touch--apply",
  MAYBE: "border-maybe/40 bg-maybe-soft text-maybe decision-touch decision-touch--maybe",
  SKIP: "border-skip/40 bg-skip-soft text-skip decision-touch decision-touch--skip",
};

const meanings: Record<Decision, string> = {
  APPLY: "Key known requirements are met.",
  MAYBE: "Something important is uncertain or needs verification.",
  SKIP: "A critical requirement is not met.",
};

export function DecisionBadge({ decision, size = "md" }: { decision: Decision; size?: "sm" | "md" | "lg" }) {
  const sizing =
    size === "lg" ? "px-5 py-2 text-3xl md:text-4xl" : size === "sm" ? "px-2 py-0.5 text-xs tracking-[0.12em]" : "px-3 py-1 text-lg";
  return (
    <span
      className={`inline-flex border font-display tracking-wide ${sizing} ${styles[decision]}`}
      aria-label={`Decision ${decision}. ${meanings[decision]}`}
    >
      {decision}
    </span>
  );
}