const RULE_PATH_LABELS = {
  critical_not_met: "A critical requirement was not met → SKIP",
  keys_met_no_uncertainty: "Key requirements matched with no uncertainty → APPLY",
  default_maybe: "Uncertainty or non-critical gaps → MAYBE",
  expired_override: "Listing expired (deadline or stored EXPIRED) → SKIP",
} as const;

export function DecisionAuditPanel({
  audit,
}: {
  audit: {
    rulePath: keyof typeof RULE_PATH_LABELS;
    criticalNotMet: string[];
    uncertainKeys: string[];
    effectiveVerificationStatus: string;
    fitScoreIsAdvisoryOnly: true;
    decidedAt: string;
  };
}) {
  return (
    <details className="mt-12 border border-line bg-surface p-4">
      <summary className="cursor-pointer font-medium">Decision audit (debug)</summary>
      <p className="mt-3 text-sm text-muted">
        Engine trail only. Fit score is advisory. HULUM is not the official organization.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium">Rule path</dt>
          <dd className="text-muted">{RULE_PATH_LABELS[audit.rulePath]}</dd>
        </div>
        <div>
          <dt className="font-medium">Verification (effective)</dt>
          <dd className="text-muted">{audit.effectiveVerificationStatus.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="font-medium">Critical not met</dt>
          <dd className="text-muted">
            {audit.criticalNotMet.length > 0 ? audit.criticalNotMet.join(", ") : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Uncertain keys</dt>
          <dd className="text-muted">
            {audit.uncertainKeys.length > 0 ? audit.uncertainKeys.join(", ") : "None"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Decided at (UTC)</dt>
          <dd className="text-muted">{audit.decidedAt}</dd>
        </div>
      </dl>
    </details>
  );
}
