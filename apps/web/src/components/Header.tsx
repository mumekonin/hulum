"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/storage";

const links = [
  { href: "/journey", label: "Journey" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/screenshot", label: "Screenshot" },
  { href: "/profile", label: "Profile" },
  { href: "/assistant", label: "Ask HULUM" },
  { href: "/research", label: "Research" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    clearSession();
    router.replace("/");
  }

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/profile" className="font-display text-2xl tracking-tight" aria-label="HULUM home">
          HULUM
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm sm:gap-2">
          {links.map((link) => {
            const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-3 py-2 ${current ? "font-medium text-ink underline" : "text-muted hover:text-ink"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 items-center px-3 py-2 text-muted hover:text-ink"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
