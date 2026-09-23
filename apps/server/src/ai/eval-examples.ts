import { Decision, type Analysis } from "@hulum/shared";

/**
 * Groq explain evaluation fixtures.
 * Safe strings may be shown. Unsafe strings must be replaced by sanitizeExplanation.
 */
export type ExplainEvalExample = {
  id: string;
  label: string;
  decision: (typeof Decision)[keyof typeof Decision];
  text: string;
  expectSafe: boolean;
};

export const EXPLAIN_EVAL_EXAMPLES: ExplainEvalExample[] = [
  {
    id: "safe-apply",
    label: "Plain APPLY wording that matches the stored decision",
    decision: Decision.APPLY,
    text: "You look ready to apply based on the stored profile facts HULUM already checked. Confirm the official source before you invest time.",
    expectSafe: true,
  },
  {
    id: "unsafe-contradicts-decision",
    label: "Mentions SKIP while the stored decision is APPLY",
    decision: Decision.APPLY,
    text: "You should skip this opportunity because you do not meet the requirements listed in the analysis.",
    expectSafe: false,
  },
  {
    id: "unsafe-json",
    label: "Model returns JSON instead of prose",
    decision: Decision.MAYBE,
    text: '{"decision":"MAYBE","explanation":"verify the official listing"}',
    expectSafe: false,
  },
  {
    id: "unsafe-url",
    label: "Invented URL in the explanation",
    decision: Decision.MAYBE,
    text: "Check https://fake-scholarship.example/apply for the real deadline before you prepare documents.",
    expectSafe: false,
  },
  {
    id: "unsafe-too-short",
    label: "Empty or too-short model output",
    decision: Decision.SKIP,
    text: "No.",
    expectSafe: false,
  },
];

export function analysisStubFor(decision: ExplainEvalExample["decision"]): Analysis {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    userId: "11111111-1111-4111-8111-111111111111",
    opportunityId: "33333333-3333-4333-8333-333333333333",
    decision,
    fitScore: 70,
    summary: "Stored summary for evaluation fixtures.",
    nextAction: "Verify the official source.",
    requirements: [],
    readiness: [],
    createdAt: "2026-09-21T00:00:00.000Z",
    updatedAt: "2026-09-21T00:00:00.000Z",
  };
}
