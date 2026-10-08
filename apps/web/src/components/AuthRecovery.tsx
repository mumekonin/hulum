"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiClientError, api } from "@/lib/api";
import { isValidEmail, resetRequestErrorMessage } from "@/lib/password-reset";
import {
  AuthHeading,
  AuthNotice,
  AuthShell,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "./AuthShell";

type Phase = "idle" | "sending" | "sent";

const SENT_MESSAGE =
  "If an account exists for this email, you'll receive a password reset link shortly. The link works once and expires in 30 minutes.";

export function AuthRecovery() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (phase !== "idle") return;
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setPhase("sending");
    try {
      await api<{ status: "requested" }>("/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setPhase("sent");
    } catch (err) {
      setPhase("idle");
      setError(resetRequestErrorMessage(err instanceof ApiClientError ? err : undefined));
    }
  }

  function useDifferentEmail() {
    setPhase("idle");
    setError(null);
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Reset your password."
        subtitle="Enter the email address associated with your HULUM account."
      />

      {phase === "sent" ? <AuthNotice className="mt-6">{SENT_MESSAGE}</AuthNotice> : null}
      {error ? (
        <AuthNotice className="mt-6">
          <span id="recovery-email-error">{error}</span>
        </AuthNotice>
      ) : null}

      <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="recovery-email">
            Email address
          </label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@domain.com"
            value={email}
            readOnly={phase !== "idle"}
            aria-invalid={error !== null}
            aria-describedby={error ? "recovery-email-error" : undefined}
            onChange={(ev) => setEmail(ev.target.value)}
            className={authInputClass}
          />
        </div>

        <button
          type="submit"
          disabled={phase !== "idle"}
          className={`mt-1.5 ${authPrimaryButtonClass}`}
        >
          {phase === "sending" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
          ) : null}
          <span>
            {phase === "sending"
              ? "Sending…"
              : phase === "sent"
                ? "Reset link sent"
                : "Send reset link"}
          </span>
        </button>
      </form>

      {phase === "sent" ? (
        <p className="mt-4 text-center text-[14px] text-gw-muted">
          Wrong address?{" "}
          <button
            type="button"
            onClick={useDifferentEmail}
            className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
          >
            Use a different email
          </button>
        </p>
      ) : null}

      <p className="mt-6 text-center text-[14px] text-gw-muted">
        <Link
          href="/sign-in"
          className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
