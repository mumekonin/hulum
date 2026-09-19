import { Decision } from "@hulum/shared";

export const ANALYSIS_SUMMARY = {
  [Decision.APPLY]: "You meet the key known requirements.",
  [Decision.MAYBE]: "Some requirements need verification before you apply.",
  [Decision.SKIP]: "This opportunity does not match your current profile.",
} as const;
