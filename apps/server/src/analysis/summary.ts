import { Decision, OFFICIAL_SOURCE_NOTICE } from "@hulum/shared";

export const ANALYSIS_SUMMARY = {
  [Decision.APPLY]: "You meet the key known requirements.",
  [Decision.MAYBE]: "Some requirements need verification before you apply.",
  [Decision.SKIP]: "This opportunity does not match your current profile.",
} as const;

export function analysisSummaryFor(decision: Decision): string {
  return `${ANALYSIS_SUMMARY[decision]} ${OFFICIAL_SOURCE_NOTICE}`;
}
