import { Decision, OFFICIAL_SOURCE_NOTICE, type RequirementMatch } from "@hulum/shared";

export const ANALYSIS_SUMMARY = {
  [Decision.APPLY]: "You meet the key known requirements.",
  [Decision.MAYBE]: "Some requirements need verification before you apply.",
  [Decision.SKIP]: "This opportunity does not match your current profile.",
} as const;

function clause(item: RequirementMatch): string {
  const label = item.text.trim() || item.key;
  const reason = (item.reason ?? "").trim();
  if (reason === "" || reason.toLowerCase() === label.toLowerCase()) {
    return label;
  }
  return `${label}: ${reason}`;
}

/**
 * Headline plus the stored matcher reasons that actually drove APPLY / MAYBE / SKIP.
 * Groq never writes this string.
 */
export function analysisSummaryFor(decision: Decision, matches: RequirementMatch[] = []): string {
  const head = ANALYSIS_SUMMARY[decision];
  const active = matches.filter((item) => item.status !== "NOT_APPLICABLE");
  const pick =
    decision === Decision.SKIP
      ? active.filter((item) => item.status === "NOT_MET")
      : decision === Decision.MAYBE
        ? active.filter((item) => item.status === "UNCERTAIN" || item.status === "NOT_MET")
        : active.filter((item) => item.status === "MET");
  const detail = pick.slice(0, 3).map(clause).filter((line) => line.length > 0);
  const body = detail.length === 0 ? head : `${head} ${detail.join(" ")}`;
  return `${body} ${OFFICIAL_SOURCE_NOTICE}`;
}
