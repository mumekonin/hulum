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
      <p className="mt-5 text-[15px] text-[#111111]" role="status">
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
    <form className="mt-5" onSubmit={onSubmit} noValidate>
      <p className="text-[13px] leading-5 text-[#5E5B55]">
        Stay informed about opportunities, useful updates, and what matters to you.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
          className="hulum-field h-11 min-w-0 flex-1 border border-[#D9D7D0] bg-white px-3 text-sm text-[#111111] placeholder:text-[#8A867E]"
        />
        <button
          type="submit"
          disabled={status === "busy"}
          className="hulum-btn hulum-btn-primary h-11 shrink-0 bg-[#111111] px-4 text-sm font-medium text-[#F5F3EE] disabled:opacity-60 sm:px-5"
        >
          Subscribe
        </button>
      </div>
      {message ? (
        <p id="hulum-newsletter-status" role="alert" className="mt-2 text-[13px] text-[#9B2C2C]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
