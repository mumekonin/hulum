import Link from "next/link";
import { BrandMark } from "./BrandMark";

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: LinkedInIcon },
  { label: "Instagram", href: "https://www.instagram.com", icon: InstagramIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
] as const;

export function WelcomeFooter() {
  return (
    <footer className="welcome-footer bg-[#0B0B0B] text-[#F5F3ED]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 self-start text-[#F5F3ED]">
            <BrandMark />
            <span className="font-gw-serif text-[21px] font-semibold tracking-[0.08em]">HULUM</span>
          </Link>
          <ul className="flex items-center gap-1" aria-label="Social">
            {social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center text-[#F5F3ED] transition-opacity duration-200 hover:opacity-60"
                >
                  <item.icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-[#2A2A2A] pt-4">
          <p className="text-[13px] text-[#A7A59E]">© 2026 HULUM</p>
        </div>
      </div>
    </footer>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10.5V16.5M8 7.75h.01M12 16.5v-3.4a1.9 1.9 0 0 1 3.8 0v3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13.1V16.5" strokeLinecap="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="16.7" cy="7.3" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" strokeLinecap="round" />
    </svg>
  );
}
