"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AuthHeading,
  AuthNotice,
  AuthShell,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "./AuthShell";

const NOT_WIRED =
  "Password reset email is not connected yet. Return to sign in, or create a new account with email and password.";

export function AuthRecovery() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    window.setTimeout(() => {
      setBusy(false);
      setNotice(NOT_WIRED);
    }, 700);
  }

  return (
    <AuthShell>
      <AuthHeading title="Reset your password." subtitle="Enter the email you use for HULUM." />

      {notice ? <AuthNotice className="mt-6">{notice}</AuthNotice> : null}

      <form className="mt-7 flex flex-col gap-4" onSubmit={handleForgotSubmit}>
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
            onChange={(ev) => setEmail(ev.target.value)}
            className={authInputClass}
          />
        </div>

        <button type="submit" disabled={busy} className={`mt-1.5 ${authPrimaryButtonClass}`}>
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
          ) : null}
          <span>{busy ? "Checking…" : "Send reset link"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-gw-muted">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
        >
          Back to sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-[14px] text-gw-muted">
        New to HULUM?{" "}
        <Link
          href="/verify"
          className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
