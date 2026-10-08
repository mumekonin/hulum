import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-2xl bg-wl-bg px-6 py-16 text-wl-ink">
      <p className="font-gw-mono text-[11px] uppercase tracking-[0.2em] text-wl-muted">HULUM</p>
      <h1 className="mt-3 font-gw-serif text-4xl">Terms</h1>
      <p className="mt-6 text-[15px] leading-7 text-wl-muted">
        HULUM is a decision aid, not an official eligibility authority. APPLY, MAYBE, and SKIP are
        signals from your saved profile and the stored listing. Confirm deadlines and requirements
        with the organization before you apply.
      </p>
      <Link href="/" className="mt-8 inline-block text-[14px] text-wl-ink underline-offset-4 hover:underline">
        Back to HULUM
      </Link>
    </main>
  );
}
