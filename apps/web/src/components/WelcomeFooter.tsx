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

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: LinkedInIcon },
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
] as const;

const linkClass =
  "text-[15px] font-medium text-[#F5F3EE] underline decoration-transparent underline-offset-[5px] transition-[color,text-decoration-color] duration-200 hover:decoration-[#F5F3EE]";

export function WelcomeFooter() {
  return (
    <footer className="welcome-footer relative bg-[#0B0B0B] text-[#F5F3ED]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-10 pt-16 sm:px-8 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)_minmax(0,1fr)] lg:gap-8">
          <div className="order-2 grid gap-8 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:justify-self-start">
            <NavGroup label="Explore" links={explore} />
            <NavGroup label="Account" links={account} />
          </div>
          <BrandCard />
          <div className="order-3 lg:justify-self-end lg:text-right">
            <p className="font-gw-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#A7A39B]">
              Connect
            </p>
            <ul className="mt-3.5 flex items-center gap-1 lg:justify-end" aria-label="Social">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="welcome-footer__social inline-flex h-10 w-10 items-center justify-center text-[#F5F3EE] transition-[opacity,transform] duration-200 hover:opacity-60"
                  >
                    <item.icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/12 pt-4 lg:mt-10">
          <p className="text-[13px] text-[#A7A39B]">© 2026 HULUM</p>
        </div>
      </div>
    </footer>
  );
}

function BrandCard() {
  return (
    <div className="order-1 mx-auto w-full max-w-[440px] rounded-[20px] border border-[#E4E2DB] bg-[#F7F6F2] px-8 py-9 text-center text-[#111111] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)] lg:order-2">
      <Link href="/" className="inline-flex items-center gap-2.5 text-[#111111]">
        <BrandMark />
        <span className="font-gw-serif text-[21px] font-semibold tracking-[0.08em]">HULUM</span>
      </Link>
      <p className="mt-4 font-gw-serif text-[26px] leading-snug">Know what is worth your time.</p>
      <WelcomeNewsletter />
    </div>
  );
}

function NavGroup({
  label,
  links,
}: {
  label: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <nav aria-label={label}>
      <p className="font-gw-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#A7A39B]">
        {label}
      </p>
      <ul className="mt-3.5 grid gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10.5V16.5M8 7.75h.01M12 16.5v-3.4a1.9 1.9 0 0 1 3.8 0v3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13.1V16.5" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="16.7" cy="7.3" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" strokeLinecap="round" />
    </svg>
  );
}
