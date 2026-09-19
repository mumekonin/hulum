import Link from "next/link";

const journey = [
  { n: "01", title: "Create profile", href: "/profile", detail: "Education, field, country, skills, languages, documents." },
  { n: "02", title: "Browse opportunities", href: "/opportunities", detail: "Curated records with official sources and deadlines." },
  { n: "03", title: "Open one opportunity", href: "/opportunities", detail: "Read requirements. Do not treat HULUM as the issuer." },
  { n: "04", title: "Ask: should I apply?", href: "/opportunities", detail: "The engine matches your profile to structured requirements." },
  { n: "05", title: "APPLY / MAYBE / SKIP", href: "/opportunities", detail: "One decision. Fit score never replaces the rules." },
  { n: "06", title: "See why, gaps, readiness", href: "/opportunities", detail: "Matched, missing, uncertain, and what to prepare next." },
  { n: "07", title: "Open the official source", href: "/opportunities", detail: "Always confirm eligibility and deadlines with the organization." },
];

export default function HomePage() {
  return (
    <section className="max-w-4xl">
      <p className="text-sm uppercase tracking-[0.2em] text-forest">Your AI opportunity decision agent</p>
      <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
        Don’t collect more opportunities. Decide which ones are worth your time.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        HULUM compares your profile with a verified opportunity and returns one answer:
        APPLY, MAYBE, or SKIP — then shows why, what is missing, and what to prepare.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/profile" className="inline-flex min-h-11 items-center bg-ink px-5 py-3 text-paper">
          Create your profile
        </Link>
        <Link href="/opportunities" className="inline-flex min-h-11 items-center border border-ink px-5 py-3">
          Browse opportunities
        </Link>
      </div>

      <div className="mt-14 grid gap-3 md:grid-cols-3" role="list" aria-label="Decision meanings">
        <div className="border border-line border-l-4 border-l-apply bg-white/70 p-4" role="listitem">
          <p className="font-display text-2xl text-ink">APPLY</p>
          <p className="mt-2 text-sm text-muted">Key known requirements are met. Prepare materials and confirm the official source.</p>
        </div>
        <div className="border border-line border-l-4 border-l-maybe bg-white/70 p-4" role="listitem">
          <p className="font-display text-2xl text-ink">MAYBE</p>
          <p className="mt-2 text-sm text-muted">Something important is uncertain or needs verification. Do not treat this as a yes.</p>
        </div>
        <div className="border border-line border-l-4 border-l-skip bg-white/70 p-4" role="listitem">
          <p className="font-display text-2xl text-ink">SKIP</p>
          <p className="mt-2 text-sm text-muted">A critical requirement is not met. Spend time on a closer match.</p>
        </div>
      </div>

      <h2 className="mt-16 font-display text-3xl">The HULUM journey</h2>
      <ol className="mt-6 grid gap-3">
        {journey.map((step) => (
          <li key={step.n} className="border border-line bg-white/60 p-4 md:flex md:items-baseline md:gap-6">
            <span className="text-sm text-muted">{step.n}</span>
            <div className="mt-1 md:mt-0">
              <Link href={step.href} className="font-display text-xl hover:underline">
                {step.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 border border-line bg-white/80 px-4 py-3 text-sm leading-6 text-muted">
        HULUM&apos;s analysis is based on the information available from the opportunity source and your
        profile. Always verify final eligibility and deadlines with the official organization. Voice uses
        text and quick actions until Voxide is connected; those actions must stay on this same path.
      </p>
    </section>
  );
}
