"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initialsOf, useAccount, type Account } from "@/lib/account";
import { clearSession } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = { href: string; label: string };

const primaryLinks: NavLink[] = [
  { href: "/opportunities", label: "Discover" },
  { href: "/my-opportunities", label: "My opportunities" },
  { href: "/readiness", label: "Readiness" },
  { href: "/assistant", label: "Ask HULUM" },
];

const profileLink: NavLink = { href: "/profile", label: "Profile" };

const moreLinks: NavLink[] = [
  { href: "/screenshot", label: "Screenshot" },
  { href: "/journey", label: "How HULUM works" },
  { href: "/research", label: "Research" },
];

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const account = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    menu.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function signOut() {
    clearSession();
    router.replace("/");
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
        <Wordmark />
        <nav aria-label="Primary" className="mt-10 flex flex-1 flex-col">
          <NavList links={primaryLinks} pathname={pathname} />
          <div className="my-5 border-t border-line" />
          <NavList links={[profileLink]} pathname={pathname} />
          <p className="mt-8 px-3 text-xs uppercase tracking-[0.14em] text-muted">More</p>
          <NavList links={moreLinks} pathname={pathname} small />
        </nav>
        <AccountBlock account={account} onSignOut={signOut} />
      </aside>

      <header className="sticky top-0 z-40 border-b border-line bg-paper lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Wordmark />
          <div className="flex items-center">
            <ThemeToggle />
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex min-h-11 items-center px-3 text-sm text-ink"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav
            ref={menu}
            id="mobile-menu"
            aria-label="Primary"
            className="border-t border-line px-2 pb-4 pt-2"
          >
            <NavList links={primaryLinks} pathname={pathname} />
            <div className="my-3 border-t border-line" />
            <NavList links={[profileLink]} pathname={pathname} />
            <NavList links={moreLinks} pathname={pathname} small />
            <div className="mt-3 border-t border-line pt-3">
              <AccountSummary account={account} />
              <button
                type="button"
                onClick={signOut}
                className="mt-2 inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink"
              >
                Sign out
              </button>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}

function Wordmark() {
  return (
    <Link
      href="/opportunities"
      className="px-3 font-display text-2xl tracking-tight text-ink"
      aria-label="HULUM, go to Discover"
    >
      HULUM
    </Link>
  );
}

function NavList({
  links,
  pathname,
  small = false,
}: {
  links: NavLink[];
  pathname: string;
  small?: boolean;
}) {
  return (
    <ul className="grid gap-0.5">
      {links.map((link) => {
        const current = isCurrent(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={`flex min-h-11 items-center px-3 transition-colors ${small ? "text-sm" : "text-[15px]"} ${
                current ? "bg-surface-muted font-medium text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-muted text-xs font-medium tracking-wide text-ink"
    >
      {initialsOf(name)}
    </span>
  );
}

function AccountSummary({ account }: { account: Account | null }) {
  return (
    <Link
      href="/profile"
      className="flex min-h-11 items-center gap-3 px-3 py-2 hover:bg-surface-muted"
    >
      <Avatar name={account?.name ?? ""} />
      <span className="min-w-0">
        <span className="block truncate text-sm text-ink">{account?.name ?? "Your profile"}</span>
        {account?.email ? (
          <span className="block truncate text-xs text-muted">{account.email}</span>
        ) : null}
      </span>
    </Link>
  );
}

function AccountBlock({ account, onSignOut }: { account: Account | null; onSignOut: () => void }) {
  return (
    <div className="border-t border-line pt-4">
      <AccountSummary account={account} />
      <div className="mt-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex min-h-11 items-center px-2 text-sm text-muted hover:text-ink"
        >
          Sign out
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
