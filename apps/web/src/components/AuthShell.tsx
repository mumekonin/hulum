import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export const authInputClass =
  "h-12 w-full rounded-lg border border-[#e2e0db] bg-white px-3.5 font-sans text-[15px] text-gw-primary placeholder:text-[#a9a69f] transition-colors hover:border-[#cfccc5] focus:border-gw-primary focus:outline-none dark:border-[#2a2a2a] dark:bg-[#0f0f0f] dark:placeholder:text-[#5f5d58] dark:hover:border-[#3a3a3a]";

export const authLabelClass = "font-gw-mono text-[11px] uppercase tracking-[0.08em] text-gw-muted";

export const authPrimaryButtonClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gw-primary text-[14px] font-semibold text-gw-on-primary transition-opacity hover:opacity-90 disabled:opacity-60";

export function AuthNotice({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`rounded-lg border border-[#e2e0db] bg-[#f6f5f2] px-4 py-3 text-[13px] leading-5 text-gw-primary dark:border-[#2a2a2a] dark:bg-[#1a1a1a] ${className}`}
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafaf8] px-4 pb-8 pt-16 font-sans sm:px-6 md:py-16 dark:bg-[#0b0b0b]">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-5">
        <ThemeToggle />
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="grid w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[#e7e5e0] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04),0_8px_24px_-12px_rgba(20,20,20,0.08)] md:max-w-[960px] md:grid-cols-[46fr_54fr] md:min-h-[580px] dark:border-[#2a2a2a] dark:bg-[#141414] dark:shadow-none"
      >
        <section className="flex flex-col items-center justify-center border-b border-[#ecebe6] bg-[#f6f5f2] px-8 py-6 text-center md:border-b-0 md:border-r md:px-12 md:py-12 dark:border-[#232323] dark:bg-[#101010]">
          <HulumMark />
          <p className="mt-4 font-gw-mono text-[12px] font-medium uppercase tracking-[0.28em] text-gw-primary md:mt-6">
            HULUM
          </p>
          <h1 className="mt-3 max-w-[340px] text-balance font-gw-serif text-[26px] leading-[1.12] tracking-tight text-gw-primary md:mt-5 md:text-[36px]">
            Know what is worth your time.
          </h1>
          <p className="mt-4 hidden max-w-[300px] text-[15px] leading-[1.65] text-gw-muted sm:block md:mt-6">
            Understand opportunities.
            <br />
            Know where you stand.
            <br />
            Apply with confidence.
          </p>
        </section>

        <section className="flex flex-col justify-center px-6 py-7 sm:px-10 md:px-11 md:py-12">
          {children}
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

function HulumMark() {
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gw-primary font-gw-serif text-[28px] font-semibold leading-none text-gw-on-primary md:h-16 md:w-16 md:rounded-[16px] md:text-[38px]"
    >
      H
    </span>
  );
}
