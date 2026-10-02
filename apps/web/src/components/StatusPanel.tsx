import Link from "next/link";

type Action = { label: string; onClick: () => void } | { label: string; href: string };

export function StatusPanel({
  variant,
  title,
  children,
  primary,
  secondary,
}: {
  variant: "loading" | "empty" | "error";
  title: string;
  children?: React.ReactNode;
  primary?: Action;
  secondary?: Action;
}) {
  const isError = variant === "error";
  const isLoading = variant === "loading";

  return (
    <div
      className={`mt-8 border px-5 py-5 ${isError ? "border-skip/40 bg-skip-soft" : "border-line bg-surface"}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-busy={isLoading}
    >
      <p className={`font-display text-xl ${isError ? "text-skip" : "text-ink"}`}>
        {isLoading ? <span aria-hidden className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-muted align-middle" /> : null}
        {title}
      </p>
      {children ? <div className="mt-2 text-sm leading-6 text-muted">{children}</div> : null}
      {primary || secondary ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {primary ? <ActionControl action={primary} kind="primary" /> : null}
          {secondary ? <ActionControl action={secondary} kind="secondary" /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ActionControl({ action, kind }: { action: Action; kind: "primary" | "secondary" }) {
  const className =
    kind === "primary"
      ? "inline-flex min-h-11 items-center bg-ink px-4 py-2 text-sm text-paper transition-opacity hover:opacity-90"
      : "inline-flex min-h-11 items-center border border-line-strong px-4 py-2 text-sm transition-colors hover:border-ink";

  if ("href" in action) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}
