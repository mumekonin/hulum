"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initialsOf, useAccount, type Account } from "@/lib/account";
import { clearSession } from "@/lib/storage";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = { href: string; label: string };

const primaryLinks: NavLink[] = [
  { href: "/opportunities", label: "Discover" },
  { href: "/my-opportunities", label: "My opportunities" },
  { href: "/readiness", label: "Readiness" },
  { href: "/assistant", label: "Ask HULUM" },
];

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
    router.replace("/sign-in");
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
        <Wordmark />
        <nav aria-label="Primary" className="mt-10 flex flex-1 flex-col">
          <NavList links={primaryLinks} pathname={pathname} />
          <p className="mt-8 px-3 text-xs uppercase tracking-[0.14em] text-muted">More</p>
          <NavList links={moreLinks} pathname={pathname} small />
        </nav>
        <AccountMenu account={account} onSignOut={signOut} showAppearance />
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
            className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-line px-2 pb-4 pt-2"
          >
            <NavList links={primaryLinks} pathname={pathname} />
            <div className="my-3 border-t border-line" />
            <NavList links={[profileLink]} pathname={pathname} />
            <p className="mt-4 px-3 pb-1 text-xs uppercase tracking-[0.14em] text-muted">More</p>
            <NavList links={moreLinks} pathname={pathname} small />
            <div className="mt-3 border-t border-line pt-3">
              <AccountMenu account={account} onSignOut={signOut} />
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
      className="flex items-center gap-2.5 px-3 text-ink"
      aria-label="HULUM, go to Discover"
    >
      <BrandMark />
      <span className="font-display text-[21px] font-semibold tracking-[0.08em]">HULUM</span>
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
              className={`relative flex min-h-11 items-center rounded-md px-3 transition-colors ${small ? "text-sm" : "text-[15px]"} ${
                current
                  ? "bg-surface-muted font-medium text-ink before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:rounded-full before:bg-wl-accent"
                  : "text-muted hover:bg-surface-muted/60 hover:text-ink"
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 6.5 8 10.5 12 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const menuItemClass =
  "flex min-h-11 w-full items-center px-3 text-left text-sm text-ink transition-colors hover:bg-surface-muted";

function AccountMenu({
  account,
  onSignOut,
  showAppearance = false,
}: {
  account: Account | null;
  onSignOut: () => void;
  showAppearance?: boolean;
}) {
  const pathname = usePathname();
  const menuId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = account?.name?.trim() || "Your account";
  const onProfile = isCurrent(pathname, "/profile");

  return (
    <div ref={wrap} className="relative">
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="mb-2 overflow-hidden rounded-lg border border-line bg-surface shadow-[0_8px_24px_-12px_rgba(20,20,20,0.18)]"
        >
          <Link
            role="menuitem"
            href="/profile"
            aria-current={onProfile ? "page" : undefined}
            className={`${menuItemClass} ${onProfile ? "font-medium" : ""}`}
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button role="menuitem" type="button" onClick={onSignOut} className={menuItemClass}>
            Log out
          </button>
          {showAppearance ? (
            <div className="flex items-center justify-between border-t border-line px-3 py-1">
              <span className="text-xs text-muted">Appearance</span>
              <ThemeToggle className="h-10 w-10" />
            </div>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`relative flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-muted ${
          onProfile
            ? "bg-surface-muted before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-wl-accent"
            : ""
        }`}
      >
        <Avatar name={account?.name ?? ""} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{name}</span>
          {account?.email ? (
            <span className="block truncate text-xs text-muted">{account.email}</span>
          ) : (
            <span className="block text-xs text-muted">Account</span>
          )}
        </span>
        <Chevron open={open} />
      </button>
    </div>
  );
}
