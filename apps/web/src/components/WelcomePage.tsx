import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { WelcomeFooter } from "./WelcomeFooter";
import { DecisionPath } from "./WelcomeJourney";

const rise = "motion-safe:animate-[wl-rise_550ms_cubic-bezier(0.2,0.7,0.2,1)_both]";

export function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-wl-bg font-sans text-wl-ink">
      <BackdropPattern />

      <div className="relative flex w-full flex-1 items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
      <main
        id="main-content"
        tabIndex={-1}
        className="relative grid w-full max-w-[1120px] overflow-hidden rounded-[22px] border border-wl-line bg-wl-surface shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_60px_-28px_rgba(17,17,17,0.18)] lg:min-h-[620px] lg:grid-cols-[58fr_42fr] dark:shadow-none"
      >
        <div className="absolute right-3 top-3 z-10 sm:right-5 sm:top-5">
          <ThemeToggle />
        </div>

        <section className="flex flex-col px-6 py-7 sm:px-12 sm:py-11 lg:px-14 lg:py-12">
          <Link href="/" className={`${rise} flex items-center gap-2.5 self-start`}>
            <BrandMark />
            <span className="font-gw-serif text-[21px] font-semibold tracking-[0.08em] text-wl-ink">
              HULUM
            </span>
          </Link>

          <div className="flex flex-1 flex-col justify-center pt-10 sm:pt-14 lg:pt-0">
            <p
              className={`${rise} font-gw-mono text-[11px] uppercase tracking-[0.22em] text-wl-muted [animation-delay:80ms]`}
            >
              Opportunity decision platform
            </p>
            <h1
              className={`${rise} mt-4 font-gw-serif text-[40px] leading-[1.02] tracking-[-0.015em] text-wl-ink [animation-delay:140ms] sm:text-[56px] lg:text-[66px]`}
            >
              Know what is worth
              <br />
              your time.
            </h1>
            <p
              className={`${rise} mt-6 max-w-[480px] text-[16px] leading-[1.65] text-wl-muted [animation-delay:220ms] sm:text-[17px]`}
            >
              Find opportunities, understand your fit, and know exactly what to prepare before you
              apply.
            </p>

            <div className={`${rise} mt-8 [animation-delay:300ms]`}>
              <Link
                href="/sign-in"
                className="wl-cta inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-wl-ink px-7 text-[15px] font-semibold tracking-[0.02em] text-wl-surface sm:w-auto"
              >
                <span className="relative z-[1]">Get started</span>
                <span aria-hidden className="wl-cta__arrow relative z-[1]">
                  →
                </span>
              </Link>
              <p className="mt-5 text-center text-[14px] text-wl-muted sm:text-left">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-wl-ink underline-offset-4 transition-colors hover:text-wl-accent hover:underline"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="How HULUM narrows opportunities down to one decision"
          className={`${rise} relative flex items-center justify-center border-t border-wl-line overflow-hidden bg-wl-soft px-6 py-6 [animation-delay:420ms] sm:py-10 lg:border-l lg:border-t-0 lg:px-10`}
        >
          <DecisionPath />
        </section>
      </main>
      </div>
      <WelcomeFooter />
    </div>
  );
}

function BackdropPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-wl-ink opacity-[0.09] dark:opacity-[0.14]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
      aria-hidden
    >
      <defs>
        <pattern id="wl-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="currentColor" />
        </pattern>
        <pattern id="wl-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </pattern>
      </defs>

      <rect width="1440" height="900" fill="url(#wl-grid)" opacity="0.35" />

      <rect x="56" y="36" width="240" height="96" fill="url(#wl-dots)" />
      <rect x="1196" y="150" width="176" height="256" fill="url(#wl-dots)" />
      <rect x="40" y="640" width="208" height="192" fill="url(#wl-dots)" />
      <rect x="1060" y="784" width="288" height="80" fill="url(#wl-dots)" />

      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="1360" cy="-40" r="300" />
        <circle cx="1360" cy="-40" r="420" />
        <circle cx="1360" cy="-40" r="560" strokeDasharray="3 7" />
        <circle cx="60" cy="960" r="260" />
        <circle cx="60" cy="960" r="380" strokeDasharray="3 7" />
        <path d="M-20 520 C 280 430, 520 640, 820 560 S 1300 420, 1480 500" />
        <path d="M-20 560 C 300 470, 540 690, 840 600 S 1320 460, 1480 540" opacity="0.6" />
      </g>
    </svg>
  );
}
