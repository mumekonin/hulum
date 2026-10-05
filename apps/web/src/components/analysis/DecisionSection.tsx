import {
  OFFICIAL_SOURCE_NOTICE,
  type Analysis,
  type Decision,
  type ScreenshotDecisionView,
} from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";

/** The stored summary ends with the official notice; the page shows that notice once, in the source panel. */
function headline(summary: string): string {
  const trimmed = summary.trim();
  return trimmed.endsWith(OFFICIAL_SOURCE_NOTICE)
    ? trimmed.slice(0, -OFFICIAL_SOURCE_NOTICE.length).trim()
    : trimmed;
}

export type DecisionViewItem = {
  id: string;
  text: string;
  reason?: string | null;
  evidence?: string | null;
};

export type DecisionViewModel = {
  decision: Decision;
  fitScore: number;
  summary: string;
  nextAction: string;
  met: DecisionViewItem[];
  uncertain: DecisionViewItem[];
  notMet: DecisionViewItem[];
};

function itemText(item: DecisionViewItem): string {
  return item.text.trim() || item.id;
}

function ReasonList({
  title,
  items,
  mark,
  markClass,
}: {
  title: string;
  items: DecisionViewItem[];
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
              <p className="leading-7">{item.reason?.trim() || itemText(item)}</p>
              {item.reason?.trim() && itemText(item) !== item.reason.trim() ? (
                <p className="text-sm leading-6 text-muted">{itemText(item)}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SkipTable({ items }: { items: DecisionViewItem[] }) {
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
                <td className="py-3 pr-4 leading-6">{itemText(item)}</td>
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

export function DecisionView({ model }: { model: DecisionViewModel }) {
  const isSkip = model.decision === "SKIP";

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
        <DecisionBadge decision={model.decision} size="lg" />
        <p
          className="text-sm text-muted"
          aria-label={`Fit signal ${model.fitScore} out of 100. Advisory only; it does not change the decision.`}
        >
          Fit signal {model.fitScore}/100 · advisory only
        </p>
      </div>
      <p className="mt-5 max-w-2xl font-display text-2xl leading-snug">{headline(model.summary)}</p>

      {isSkip ? <SkipTable items={model.notMet} /> : null}
      <ReasonList
        title={isSkip ? "What still matched" : "Why"}
        items={model.met}
        mark="✓"
        markClass="text-apply"
      />
      <ReasonList title="What to check" items={model.uncertain} mark="?" markClass="text-maybe" />
      {isSkip ? null : <ReasonList title="Not met" items={model.notMet} mark="✕" markClass="text-skip" />}

      <section className="mt-8 border-l-2 border-ink pl-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Next step</h3>
        <p className="mt-1 leading-7">{model.nextAction}</p>
      </section>
    </section>
  );
}

function linesToItems(prefix: string, lines: string[]): DecisionViewItem[] {
  return lines.map((text, index) => ({ id: `${prefix}-${index}`, text }));
}

export function screenshotDecisionModel(view: ScreenshotDecisionView): DecisionViewModel {
  return {
    decision: view.decision,
    fitScore: view.fitScore,
    summary: view.summary,
    nextAction: view.nextAction,
    met: linesToItems("met", view.matched),
    uncertain: linesToItems("uncertain", view.uncertain),
    notMet: linesToItems("missing", view.missing),
  };
}

/**
 * Displays a stored analysis. The decision, summary, and next action all come from the
 * server (decide.ts); this component only groups requirements by their stored status.
 */
export function DecisionSection({ analysis }: { analysis: Analysis }) {
  const requirements = analysis.requirements ?? [];
  return (
    <DecisionView
      model={{
        decision: analysis.decision,
        fitScore: analysis.fitScore,
        summary: analysis.summary,
        nextAction: analysis.nextAction,
        met: requirements.filter((item) => item.status === "MET"),
        uncertain: requirements.filter((item) => item.status === "UNCERTAIN"),
        notMet: requirements.filter((item) => item.status === "NOT_MET"),
      }}
    />
  );
}
