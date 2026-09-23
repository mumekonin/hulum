import { describe, expect, it } from "vitest";
import { isUnsafeExplanation, sanitizeExplanation } from "./guard.js";
import { EXPLAIN_EVAL_EXAMPLES, analysisStubFor } from "./eval-examples.js";

describe("explain evaluation examples", () => {
  for (const example of EXPLAIN_EVAL_EXAMPLES) {
    it(`${example.id}: ${example.label}`, () => {
      const analysis = analysisStubFor(example.decision);
      expect(isUnsafeExplanation(analysis, example.text)).toBe(!example.expectSafe);
      if (example.expectSafe) {
        expect(sanitizeExplanation(analysis, example.text)).toBe(example.text.trim());
      } else {
        expect(sanitizeExplanation(analysis, example.text)).toBe(
          `${analysis.summary} ${analysis.nextAction}`.trim(),
        );
      }
    });
  }
});
