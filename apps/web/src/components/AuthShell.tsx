import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

export const authInputClass =
  "auth-field hulum-field h-12 w-full rounded-md border border-line bg-surface px-3.5 font-sans text-[15px] text-ink placeholder:text-muted";

export const authLabelClass = "font-gw-mono text-[11px] uppercase tracking-[0.08em] text-gw-muted";

export const authPrimaryButtonClass =
  "auth-submit hulum-btn hulum-btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-[14px] font-semibold text-paper disabled:opacity-60";

export const authTextLinkClass = "auth-text-link";

const authRise =
  "motion-safe:animate-[auth-rise_520ms_cubic-bezier(0.22,1,0.36,1)_both]";

export function AuthNotice({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`rounded-md border border-line bg-surface-muted px-4 py-3 text-[13px] leading-5 text-ink ${className}`}
      role="status"
    >
      {children}
    </p>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="font-gw-serif text-[28px] leading-tight text-gw-primary md:text-[32px]">
        {title}
      </h2>
      <p className="mt-2 text-[15px] text-gw-muted">{subtitle}</p>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-4 pb-8 pt-16 font-sans sm:px-6 md:py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-5">
        <ThemeToggle />
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="grid w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(20,20,20,0.04),0_8px_24px_-12px_rgba(20,20,20,0.08)] md:max-w-[960px] md:grid-cols-[46fr_54fr] md:min-h-[580px] dark:shadow-none"
      >
        <section className="flex flex-col items-center justify-center border-b border-line bg-surface-muted px-8 py-6 text-center md:border-b-0 md:border-r md:px-12 md:py-12">
          <span className={`${authRise} text-gw-primary`}>
            <BrandMark className="h-14 w-14 md:h-16 md:w-16" />
          </span>
          <p
            className={`${authRise} mt-4 font-gw-mono text-[12px] font-medium uppercase tracking-[0.28em] text-gw-primary [animation-delay:70ms] md:mt-6`}
          >
            HULUM
          </p>
          <h1
            className={`${authRise} mt-3 max-w-[340px] text-balance font-gw-serif text-[26px] font-normal not-italic leading-[1.12] tracking-tight text-gw-primary [animation-delay:140ms] md:mt-5 md:text-[36px]`}
          >
            Know what is worth your time.
          </h1>
        </section>

        <section className="flex flex-col justify-center px-6 py-7 sm:px-10 md:px-11 md:py-12">
          <div className={`${authRise} [animation-delay:180ms]`}>{children}</div>
        </section>
      </main>

      <Link
        href="/"
        className="mt-5 text-[13px] text-gw-muted underline-offset-2 transition-colors hover:text-gw-primary hover:underline md:mt-6"
      >
        <span aria-hidden>← </span>Back to HULUM
      </Link>
    </div>
  );
}

