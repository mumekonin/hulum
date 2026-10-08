import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-2xl bg-wl-bg px-6 py-16 text-wl-ink">
      <p className="font-gw-mono text-[11px] uppercase tracking-[0.2em] text-wl-muted">HULUM</p>
      <h1 className="mt-3 font-gw-serif text-4xl">Privacy</h1>
      <p className="mt-6 text-[15px] leading-7 text-wl-muted">
        Your profile, documents, and decisions stay on your account. HULUM uses them to compare you
        with an opportunity. It does not submit applications, and it does not sell your information.
      </p>
      <Link href="/" className="mt-8 inline-block text-[14px] text-wl-ink underline-offset-4 hover:underline">
        Back to HULUM
      </Link>
    </main>
  );
}
