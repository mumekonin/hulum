import { OFFICIAL_SOURCE_NOTICE, type Analysis, type Requirement } from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";

/** The stored summary ends with the official notice; the page shows that notice once, in the source panel. */
function headline(summary: string): string {
  const trimmed = summary.trim();
  return trimmed.endsWith(OFFICIAL_SOURCE_NOTICE)
    ? trimmed.slice(0, -OFFICIAL_SOURCE_NOTICE.length).trim()
    : trimmed;
}

function requirementText(item: Requirement): string {
  return item.text.trim() || item.key;
}

function ReasonList({
  title,
  items,
  mark,
  markClass,
}: {
  title: string;
  items: Requirement[];
  mark: string;
  markClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span aria-hidden className={`w-4 shrink-0 text-center font-medium ${markClass}`}>
              {mark}
            </span>
            <div className="min-w-0">
              <p className="leading-7">
                {item.reason?.trim() || requirementText(item)}
              </p>
              {item.reason?.trim() && requirementText(item) !== item.reason.trim() ? (
                <p className="text-sm leading-6 text-muted">{requirementText(item)}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SkipTable({ items }: { items: Requirement[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Requirement not met
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">
                Requirement
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Your profile
              </th>
              <th scope="col" className="py-2 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line align-top">
                <td className="py-3 pr-4 leading-6">{requirementText(item)}</td>
                <td className="py-3 pr-4 leading-6 text-muted">
                  {item.evidence?.trim() || item.reason?.trim() || "Not in your saved profile"}
                </td>
                <td className="py-3 text-skip">Not met</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Displays a stored analysis. The decision, summary, and next action all come from the
 * server (decide.ts); this component only groups requirements by their stored status.
 */
export function DecisionSection({ analysis }: { analysis: Analysis }) {
  const requirements = analysis.requirements ?? [];
  const met = requirements.filter((item) => item.status === "MET");
  const uncertain = requirements.filter((item) => item.status === "UNCERTAIN");
  const notMet = requirements.filter((item) => item.status === "NOT_MET");
  const isSkip = analysis.decision === "SKIP";

  return (
    <section
      aria-labelledby="decision-heading"
      className="motion-safe:animate-[fade-in_240ms_ease-out]"
    >
      <h2
        id="decision-heading"
        className="text-xs font-medium uppercase tracking-[0.14em] text-muted"
      >
        HULUM decision
      </h2>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <DecisionBadge decision={analysis.decision} size="lg" />
        <p
          className="text-sm text-muted"
          aria-label={`Fit signal ${analysis.fitScore} out of 100. Advisory only; it does not change the decision.`}
        >
          Fit signal {analysis.fitScore}/100 · advisory only
        </p>
      </div>
      <p className="mt-5 max-w-2xl font-display text-2xl leading-snug">
        {headline(analysis.summary)}
      </p>

      {isSkip ? <SkipTable items={notMet} /> : null}
      <ReasonList
        title={isSkip ? "What still matched" : "Why"}
        items={met}
        mark="✓"
        markClass="text-apply"
      />
      <ReasonList title="What to check" items={uncertain} mark="?" markClass="text-maybe" />
      {isSkip ? null : <ReasonList title="Not met" items={notMet} mark="✕" markClass="text-skip" />}

      <section className="mt-8 border-l-2 border-ink pl-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Next step</h3>
        <p className="mt-1 leading-7">{analysis.nextAction}</p>
      </section>
    </section>
  );
}
