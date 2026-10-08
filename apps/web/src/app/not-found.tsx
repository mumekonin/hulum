import Link from "next/link";
import { btnPrimary, btnSecondary, labelClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-paper px-5 py-16 text-ink sm:px-8"
    >
      <div className="mx-auto max-w-xl">
        <p className={labelClass}>Not found</p>
        <h1 className="mt-2 font-display text-4xl">This page doesn&apos;t exist.</h1>
        <p className="mt-4 leading-7 text-muted">
          The link may be old, or the opportunity may have been removed from HULUM&apos;s catalog.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/opportunities"
            className={btnPrimary}
          >
            Go to Discover
          </Link>
          <Link
            href="/sign-in"
            className={btnSecondary}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
