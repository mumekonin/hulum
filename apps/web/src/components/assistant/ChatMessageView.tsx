import Link from "next/link";
import { DECISIONS } from "@hulum/shared";
import { DecisionBadge } from "@/components/DecisionBadge";
import { ExternalLink } from "@/components/ExternalLink";
import {
  opportunityHref,
  type BatchCard,
  type ChatLink,
  type ChatMessage,
  type ChatPrompt,
  type DecisionCard,
  type ListCard,
} from "@/lib/chat";
import { formatDeadline } from "@/lib/format";

const MAX_LINES = 5;

function Lines({
  title,
  lines,
  mark,
  markClass,
}: {
  title: string;
  lines: string[];
  mark: string;
  markClass: string;
}) {
  if (lines.length === 0) return null;
  const shown = lines.slice(0, MAX_LINES);
  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{title}</p>
      <ul className="mt-2 space-y-1">
        {shown.map((line) => (
          <li key={line} className="flex gap-2 leading-6">
            <span aria-hidden className={`w-4 shrink-0 text-center ${markClass}`}>
              {mark}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {lines.length > shown.length ? (
        <p className="mt-1 pl-6 text-sm text-muted">
          +{lines.length - shown.length} more on the opportunity page
        </p>
      ) : null}
    </div>
  );
}

function DecisionCardView({ card }: { card: DecisionCard }) {
  return (
    <div className="mt-4 border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Decision{card.title ? ` · ${card.title}` : ""}
      </p>
      <div className="mt-2">
        <DecisionBadge decision={card.decision} />
      </div>
      <Lines title="Why" lines={card.why} mark="✓" markClass="text-apply" />
      <Lines title="What to check" lines={card.check} mark="?" markClass="text-maybe" />
      <Lines title="Not met" lines={card.notMet} mark="✕" markClass="text-skip" />
      <div className="mt-4 border-l-2 border-ink pl-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Next</p>
        <p className="mt-1 leading-6">{card.nextAction}</p>
      </div>
    </div>
  );
}

function ListCardView({ card }: { card: ListCard }) {
  return (
    <div className="mt-4 border border-line bg-surface">
      <ul className="divide-y divide-line">
        {card.items.map((item) => (
          <li key={item.id}>
            <Link
              href={opportunityHref(item.id)}
              className="block px-5 py-3 hover:bg-surface-muted"
            >
              <span className="block font-medium leading-6">{item.title}</span>
              <span className="block text-sm text-muted">
                {item.organization} · Deadline {formatDeadline(item.deadline)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {card.total > card.items.length ? (
        <p className="border-t border-line px-5 py-2 text-sm text-muted">
          Showing {card.items.length} of {card.total}
        </p>
      ) : null}
    </div>
  );
}

function BatchCardView({ card }: { card: BatchCard }) {
  return (
    <div className="mt-4 border border-line bg-surface">
      {DECISIONS.map((decision) => {
        const rows = card.rows.filter((row) => row.decision === decision);
        if (rows.length === 0) return null;
        return (
          <section key={decision} className="border-b border-line px-5 py-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <DecisionBadge decision={decision} size="sm" />
              <span className="text-sm text-muted">{rows.length}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {rows.map((row) => (
                <li key={row.analysisId}>
                  <Link
                    href={opportunityHref(row.opportunityId, row.analysisId)}
                    className="inline-flex min-h-9 items-center leading-6 underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                  >
                    {row.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {card.failed.length > 0 ? (
        <p className="px-5 py-3 text-sm text-muted">Could not analyze: {card.failed.join(", ")}.</p>
      ) : null}
    </div>
  );
}

function Actions({
  links,
  prompts,
  onPrompt,
  disabled,
}: {
  links: ChatLink[];
  prompts: ChatPrompt[];
  onPrompt: (prompt: ChatPrompt) => void;
  disabled: boolean;
}) {
  if (links.length === 0 && prompts.length === 0) return null;
  const className =
    "inline-flex min-h-10 items-center border border-line-strong px-3 text-sm transition-colors hover:border-ink disabled:opacity-60";
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          type="button"
          disabled={disabled}
          onClick={() => onPrompt(prompt)}
          className={className}
        >
          {prompt.label}
        </button>
      ))}
      {links.map((link) =>
        link.external ? (
          <ExternalLink key={link.label} href={link.href} className={className}>
            {link.label}
          </ExternalLink>
        ) : (
          <Link key={link.label} href={link.href} className={className}>
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

export function ChatMessageView({
  message,
  onPrompt,
  disabled,
}: {
  message: ChatMessage;
  onPrompt: (prompt: ChatPrompt) => void;
  disabled: boolean;
}) {
  if (message.role === "user") {
    return (
      <li className="py-6">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">You</p>
        <p className="mt-1 text-lg leading-8">{message.text}</p>
      </li>
    );
  }
  return (
    <li className="py-6">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">HULUM</p>
      <p className="mt-1 leading-7">{message.text}</p>
      {message.card?.kind === "decision" ? <DecisionCardView card={message.card} /> : null}
      {message.card?.kind === "list" ? <ListCardView card={message.card} /> : null}
      {message.card?.kind === "batch" ? <BatchCardView card={message.card} /> : null}
      <Actions
        links={message.links ?? []}
        prompts={message.prompts ?? []}
        onPrompt={onPrompt}
        disabled={disabled}
      />
    </li>
  );
}
