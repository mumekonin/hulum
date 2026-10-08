import Link from "next/link";
import { BrandMark } from "./BrandMark";

const groups = [
  {
    label: "Discover",
    links: [
      { href: "/opportunities", label: "Opportunities" },
      { href: "/journey", label: "How it works" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/verify", label: "Create account" },
    ],
  },
] as const;

const linkClass =
  "font-sans text-[15px] font-medium text-wl-ink underline decoration-transparent underline-offset-[5px] transition-[color,text-decoration-color] duration-200 hover:text-wl-accent hover:decoration-current";

export function WelcomeFooter() {
  return (
    <footer className="mt-8 w-full border-t border-wl-line pt-8 sm:mt-10 sm:pt-10">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5 self-start">
            <BrandMark />
            <span className="font-gw-serif text-[21px] font-semibold tracking-[0.08em] text-wl-ink">
              HULUM
            </span>
          </Link>
          <p className="mt-3 font-gw-serif text-[22px] leading-snug text-wl-ink">
            Know what is worth your time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:gap-x-16">
          {groups.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="font-gw-mono text-[11px] font-medium uppercase tracking-[0.18em] text-wl-muted">
                {group.label}
              </p>
              <ul className="mt-3.5 grid gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-wl-line pt-4 sm:mt-10">
        <p className="text-[13px] text-wl-muted">© 2026 HULUM</p>
      </div>
    </footer>
  );
}
