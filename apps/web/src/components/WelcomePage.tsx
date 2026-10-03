import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const rise = "motion-safe:animate-[wl-rise_700ms_cubic-bezier(0.2,0.7,0.2,1)_both]";

export function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-wl-bg font-sans text-wl-ink">
      <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:h-20">
        <Link href="/" className="font-gw-serif text-[22px] font-semibold tracking-[0.06em] text-wl-ink">
          HULUM
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="inline-flex h-9 items-center rounded-md border border-wl-line px-4 text-[14px] font-medium text-wl-ink transition-colors hover:border-wl-accent"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid w-full max-w-[1200px] flex-1 content-center items-center gap-12 px-5 pb-14 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:pb-20 lg:pt-4 xl:gap-24"
      >
        <section className={rise}>
          <p className="flex items-center gap-3 font-gw-mono text-[11px] uppercase tracking-[0.2em] text-wl-muted">
            <span className="h-px w-8 bg-wl-accent" aria-hidden />
            <span>
              Opportunity <br className="sm:hidden" />
              decision platform
            </span>
          </p>

          <h1 className="mt-6 font-gw-serif text-[42px] leading-[1.02] tracking-[-0.015em] text-wl-ink sm:mt-7 sm:text-[60px] lg:text-[72px]">
            Know what is worth
            <br />
            your time.
          </h1>

          <p className="mt-6 max-w-[540px] text-[17px] leading-[1.6] text-wl-muted sm:mt-7 sm:text-[19px]">
            Find opportunities, understand your fit, and know exactly what to prepare before you apply.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/verify"
              className="group inline-flex h-[52px] items-center justify-center gap-2 rounded-lg bg-wl-ink px-6 text-[15px] font-semibold text-wl-bg transition-colors hover:bg-wl-accent"
            >
              Explore HULUM
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-[52px] items-center justify-center rounded-lg border border-wl-line px-6 text-[15px] font-semibold text-wl-ink transition-colors hover:border-wl-accent"
            >
              Sign in
            </Link>
          </div>
        </section>

        <div className={`${rise} w-full max-w-[520px] [animation-delay:180ms] lg:max-w-none`}>
          <DecisionDiagram />
          <p className="mt-5 text-center font-gw-mono text-[11px] uppercase tracking-[0.16em] text-wl-muted">
            Grants · Fellowships · Early-career opportunities
          </p>
        </div>
      </main>
    </div>
  );
}

function DecisionDiagram() {
  return (
    <figure
      aria-label="How HULUM decides: an opportunity is checked against your fit, then marked apply, maybe, or skip."
      className="rounded-xl border border-wl-line bg-wl-surface p-6 sm:p-8"
    >
      <Node step="01" label="Opportunity">
        <div className="mt-3 space-y-2" aria-hidden>
          <span className="block h-1.5 w-[72%] rounded-full bg-wl-line" />
          <span className="block h-1.5 w-[48%] rounded-full bg-wl-line" />
        </div>
      </Node>

      <Connector />

      <Node step="02" label="Your fit">
        <ul className="mt-3 grid grid-cols-3 gap-2 text-[13px] text-wl-muted">
          {["Eligibility", "Profile", "Documents"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-wl-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Node>

      <Connector />

      <figcaption className="sr-only">Decision</figcaption>
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-wl-line">
        <Outcome label="Apply" active />
        <Outcome label="Maybe" />
        <Outcome label="Skip" />
      </div>
    </figure>
  );
}

function Node({ step, label, children }: { step: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-wl-line px-5 py-4">
      <div className="flex items-baseline justify-between">
        <span className="font-gw-serif text-[22px] leading-none text-wl-ink">{label}</span>
        <span className="font-gw-mono text-[11px] tracking-[0.12em] text-wl-muted">{step}</span>
      </div>
      {children}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <svg width="12" height="28" viewBox="0 0 12 28" fill="none" className="text-wl-line">
        <path d="M6 0v26M1.5 21.5 6 26l4.5-4.5" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

function Outcome({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 border-wl-line px-2 py-4 not-last:border-r ${
        active ? "bg-wl-accent-soft" : ""
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-wl-accent" : "bg-wl-line"}`} aria-hidden />
      <span
        className={`font-gw-mono text-[12px] uppercase tracking-[0.16em] ${active ? "text-wl-ink" : "text-wl-muted"}`}
      >
        {label}
      </span>
    </div>
  );
}
