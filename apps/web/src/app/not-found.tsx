import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-paper px-5 py-16 text-ink sm:px-8"
    >
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Not found</p>
        <h1 className="mt-2 font-display text-4xl">This page doesn&apos;t exist.</h1>
        <p className="mt-4 leading-7 text-muted">
          The link may be old, or the opportunity may have been removed from HULUM&apos;s catalog.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/opportunities"
            className="inline-flex min-h-11 items-center bg-ink px-5 text-paper"
          >
            Go to Discover
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center border border-line-strong px-5 hover:border-ink"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
