import type { Decision } from "@hulum/shared";

const styles: Record<Decision, string> = {
  APPLY: "bg-apply text-white",
  MAYBE: "bg-maybe text-white",
  SKIP: "bg-skip text-white",
};

export function DecisionBadge({ decision, size = "md" }: { decision: Decision; size?: "sm" | "md" | "lg" }) {
  const sizing = size === "lg" ? "px-6 py-3 text-3xl md:text-5xl" : size === "sm" ? "px-2 py-1 text-xs" : "px-4 py-2 text-xl";
  return (
    <span className={`inline-flex font-display tracking-wide ${sizing} ${styles[decision]}`}>
      {decision}
    </span>
  );
}
