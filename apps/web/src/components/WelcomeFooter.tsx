import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { WelcomeNewsletter } from "./WelcomeNewsletter";

const explore = [
  { href: "/opportunities", label: "Opportunities" },
  { href: "/journey", label: "How it works" },
] as const;

const account = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-in", label: "Get started" },
] as const;

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: LinkedInIcon },
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
] as const;

const linkClass =
  "text-[14px] text-wl-muted underline-offset-4 transition-colors duration-200 hover:text-wl-ink hover:underline";

export function WelcomeFooter() {
  return (
    <footer className="welcome-footer relative border-t border-wl-line text-wl-ink">
      <div className="welcome-footer__rise relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <PathMark />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          <div className="order-1 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-wl-ink">
              <BrandMark />
              <span className="font-gw-serif text-[21px] font-semibold tracking-[0.08em]">HULUM</span>
            </Link>
            <p className="mt-5 max-w-[18rem] font-gw-serif text-[26px] leading-tight tracking-[-0.015em] text-wl-ink">
              Know what is worth your time.
            </p>
            <p className="mt-3 max-w-[22rem] text-[14px] leading-6 text-wl-muted">
              A decision aid for opportunities. HULUM never submits an application for you.
            </p>
          </div>

          <nav aria-label="Footer" className="order-3 grid grid-cols-2 gap-8 md:order-2 lg:col-span-4 lg:col-start-5 lg:row-start-1">
            <LinkGroup label="Explore" links={explore} />
            <LinkGroup label="Account" links={account} />
          </nav>

          <div className="order-2 md:order-3 md:col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <WelcomeNewsletter />
          </div>

          <ul className="order-4 flex items-center gap-2.5 lg:col-span-4 lg:col-start-1 lg:row-start-2" aria-label="Social">
            {social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="welcome-footer__social inline-flex h-9 w-9 items-center justify-center rounded-full border border-wl-line text-wl-ink transition-colors duration-200 hover:border-wl-ink hover:bg-wl-ink hover:text-wl-surface"
                >
                  <item.icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-wl-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-gw-mono text-[12px] uppercase tracking-[0.14em] text-wl-muted">© 2026 HULUM</p>
          <ul className="flex gap-5" aria-label="Legal">
            {legal.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-[13px] text-wl-muted transition-colors hover:text-wl-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function LinkGroup({
  label,
  links,
}: {
  label: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-gw-mono text-[11px] font-medium uppercase tracking-[0.2em] text-wl-muted">{label}</p>
      <ul className="mt-4 grid gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PathMark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-16 bottom-28 left-2/3 hidden w-px -translate-x-1/2 bg-wl-ink/10 lg:block"
    >
      <span className="absolute top-[16%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-wl-accent" />
      <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-wl-ink/25" />
      <span className="absolute top-[84%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-wl-ink/25" />
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10.5V16.5M8 7.75h.01M12 16.5v-3.4a1.9 1.9 0 0 1 3.8 0v3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13.1V16.5" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="16.7" cy="7.3" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" strokeLinecap="round" />
    </svg>
  );
}
