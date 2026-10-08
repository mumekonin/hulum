"use client";

import { FormEvent, useState } from "react";
import { subscribeToNewsletter } from "@/lib/newsletter";

export function WelcomeNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "invalid" | "failed">("idle");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("busy");
    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      setStatus("done");
      return;
    }
    setStatus(result.reason);
  }

  if (status === "done") {
    return (
      <p className="text-[15px] text-wl-ink" role="status">
        You&apos;re on the list.
      </p>
    );
  }

  const message =
    status === "invalid"
      ? "Please enter a valid email address."
      : status === "failed"
        ? "Something went wrong. Please try again."
        : null;

  return (
    <form
      className="rounded-[22px] border border-wl-line bg-wl-surface px-6 py-6 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_60px_-28px_rgba(17,17,17,0.18)] dark:shadow-none"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="font-gw-mono text-[11px] font-medium uppercase tracking-[0.2em] text-wl-muted">Stay informed</p>
      <p className="mt-3 font-gw-serif text-[26px] leading-tight tracking-[-0.015em] text-wl-ink">
        Get the signal.
      </p>
      <p className="mt-2 text-[14px] leading-6 text-wl-muted">
        Occasional notes on opportunities worth your time. No application is sent for you.
      </p>
      <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row">
        <label className="sr-only" htmlFor="hulum-newsletter-email">
          Email address
        </label>
        <input
          id="hulum-newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "invalid" || status === "failed") setStatus("idle");
          }}
          aria-invalid={status === "invalid"}
          aria-describedby={message ? "hulum-newsletter-status" : undefined}
          className="hulum-field h-11 min-w-0 flex-1 rounded-lg border border-wl-line bg-wl-bg px-3 text-[14px] text-wl-ink placeholder:text-wl-muted"
        />
        <button
          type="submit"
          disabled={status === "busy"}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-wl-ink px-4 text-[14px] font-semibold text-wl-surface disabled:opacity-60 min-[480px]:px-5"
        >
          Subscribe
          <span aria-hidden>→</span>
        </button>
      </div>
      {message ? (
        <p id="hulum-newsletter-status" role="alert" className="mt-2 text-[13px] text-skip">
          {message}
        </p>
      ) : null}
    </form>
  );
}
