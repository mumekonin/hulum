import type { Decision } from "@hulum/shared";

const styles: Record<Decision, string> = {
  APPLY: "border-apply bg-apply text-white",
  MAYBE: "border-maybe bg-maybe text-white",
  SKIP: "border-skip bg-skip text-white",
};

const meanings: Record<Decision, string> = {
  APPLY: "Key known requirements are met.",
  MAYBE: "Something important is uncertain or needs verification.",
  SKIP: "A critical requirement is not met.",
};

export function DecisionBadge({
  decision,
  size = "md",
}: {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}) {
  const sizing =
    size === "lg"
      ? "px-6 py-3 text-3xl md:text-5xl"
      : size === "sm"
        ? "px-3 py-2 text-xs"
        : "px-4 py-2 text-xl";
  return (
    <span
      className={`inline-flex border-2 font-display tracking-wide ${sizing} ${styles[decision]}`}
      aria-label={`Decision ${decision}. ${meanings[decision]}`}
    >
      {decision}
    </span>
  );
}
