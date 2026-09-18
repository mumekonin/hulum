import Link from "next/link";

const links = [
  { href: "/opportunities", label: "Opportunities" },
  { href: "/profile", label: "Profile" },
  { href: "/assistant", label: "Ask HULUM" },
];

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          HULUM
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
