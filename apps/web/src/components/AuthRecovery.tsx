"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const NOT_WIRED =
  "Password reset email is not connected yet. Return to sign in, or create a new account with email and password.";

export function AuthRecovery() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dispatchLabel, setDispatchLabel] = useState("Send reset link");
  const [dispatchBusy, setDispatchBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const hasLength = newPassword.length >= 8;
  const hasMixed = /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  const entropy = useMemo(() => {
    let score = 0;
    if (newPassword.length > 0) score += 20;
    if (hasLength) score += 40;
    if (hasMixed) score += 40;
    if (score === 0) return { score, label: "WAITING", className: "text-gw-outline" };
    if (score < 60) return { score, label: "WEAK", className: "text-gw-outline-var" };
    if (score < 100) return { score, label: "OK", className: "text-gw-secondary" };
    return { score, label: "STRONG", className: "text-gw-primary font-bold" };
  }, [newPassword, hasLength, hasMixed]);

  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    setDispatchBusy(true);
    setDispatchLabel("Checking…");
    setNotice(null);
    window.setTimeout(() => {
      setDispatchBusy(false);
      setDispatchLabel("Not wired — see notice");
      setNotice(NOT_WIRED);
    }, 700);
  }

  function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setResetBusy(true);
    setNotice("Password reset is not stored yet. Sign in with the password you already have, or create a new account.");
    setResetBusy(false);
    window.setTimeout(() => {
      router.push("/");
    }, 900);
  }

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <header className="w-full border-b border-gw-outline-var/30">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.16em]">
            <Link href="/" className="font-gw-serif text-[19px] font-semibold tracking-wider text-gw-primary normal-case">
              HULUM
            </Link>
            <span className="text-gw-outline-var">/</span>
            <span className="text-gw-muted tracking-widest">Decision system [AUTH_NODE_01]</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest text-gw-muted">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-gw-primary" aria-hidden />
              <span>Gateway active</span>
            </div>
            <span className="hidden sm:inline">9.0249° N, 38.7469° E</span>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex flex-col justify-between gap-2 pb-1 text-[9px] uppercase tracking-widest text-gw-muted sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-bold text-gw-primary">SEC-PROTOCOL //</span>
              <span>AUTH_RECOVERY_MATRIX</span>
              <span className="text-gw-outline-var">·</span>
              <span>Spec: preview</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-gw-primary" aria-hidden />
                <span>Local gateway · v0.1</span>
              </span>
              <span className="text-gw-outline-var">|</span>
              <span>No email dispatch</span>
            </div>
          </div>

          {notice ? (
            <div className="flex w-full items-start justify-between gap-4 bg-gw-surface-highest px-4 py-3" role="status">
              <p className="text-[11px] tracking-wide text-gw-primary">{notice}</p>
              <span className="shrink-0 font-gw-mono text-[9px] text-gw-muted">STATUS: NOTICE</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <section className="relative flex flex-col overflow-hidden bg-gw-surface-low p-6 shadow-xl lg:col-span-5">
              <div className="mb-4 flex items-center justify-between pb-2 text-[9px] text-gw-muted">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-gw-muted/40" aria-hidden />
                  <span className="font-gw-mono uppercase tracking-widest">Phase_01 // Request</span>
                </div>
                <span className="font-gw-mono text-gw-outline">REF: 849-AUTH-RQ</span>
              </div>

              <div className="mb-6 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-gw-muted">Credential retrieval</span>
                <h1 className="font-gw-serif text-[32px] leading-[38px] text-gw-primary">Forgot your password?</h1>
                <p className="mt-1 text-[13px] leading-5 text-gw-muted">
                  Enter an email if you want it stored locally for display. v0.1 does not send reset links or store
                  passwords.
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleForgotSubmit}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-[9px] uppercase tracking-widest text-gw-muted"
                      htmlFor="recovery-email"
                    >
                      Email (optional save)
                    </label>
                    <span className="text-[9px] text-gw-outline">Local only</span>
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="evaluator@institute.org"
                    className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface focus:outline-none"
                  />
                  <span className="text-[11px] text-gw-outline-var">
                    No cryptographic token is dispatched — auth email is not wired.
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={dispatchBusy}
                    className="flex h-11 w-full items-center justify-center gap-2 bg-gw-primary px-4 text-[12px] font-medium uppercase tracking-widest text-gw-on-primary transition-colors hover:bg-gw-on disabled:opacity-60"
                  >
                    <span>{dispatchLabel}</span>
                    <span aria-hidden>→</span>
                  </button>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/"
                      className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-gw-muted transition-colors hover:text-gw-primary"
                    >
                      <span aria-hidden>←</span>
                      <span>Back to sign in</span>
                    </Link>
                    <span className="font-gw-mono text-[9px] uppercase text-gw-outline">Node: preview</span>
                  </div>
                </div>
              </form>

              <div className="mt-8 flex flex-col gap-1 border-t border-gw-outline-var/20 pt-4 font-gw-mono text-[9px] text-gw-outline-var">
                <div className="flex justify-between">
                  <span>Identity registry:</span>
                  <span className="text-gw-muted">Not connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Fallback:</span>
                  <span className="text-gw-muted">Sign in or create account</span>
                </div>
              </div>
            </section>

            <section className="relative flex flex-col overflow-hidden bg-gw-surface-low p-6 shadow-xl lg:col-span-7">
              <div className="mb-4 flex items-center justify-between pb-2 text-[9px] text-gw-muted">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-gw-primary" aria-hidden />
                  <span className="font-gw-mono uppercase tracking-widest text-gw-primary">
                    Phase_02 // Password UI
                  </span>
                </div>
                <div className="flex items-center gap-1 font-gw-mono text-gw-outline">
                  <span>UI preview</span>
                  <span className="text-gw-outline-var">/</span>
                  <span className="text-gw-primary">No store</span>
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="bg-gw-surface-highest px-1 font-gw-mono text-[9px] uppercase text-gw-primary">
                    Step 02 of 02
                  </span>
                  <span className="font-gw-mono text-[9px] text-gw-outline-var">— Target: local profile</span>
                </div>
                <h2 className="font-gw-serif text-[32px] leading-[38px] text-gw-primary">Set new password</h2>
                <p className="mt-1 text-[13px] leading-5 text-gw-muted">
                  Strength checks are UI-only. Password reset is not stored or emailed yet. Sign in with your
                  existing password, or create a new account.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="flex flex-col gap-4 md:col-span-7">
                  <form className="flex flex-col gap-4" onSubmit={handleResetSubmit}>
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-[9px] uppercase tracking-widest text-gw-muted"
                        htmlFor="new-password"
                      >
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        minLength={8}
                        value={newPassword}
                        onChange={(ev) => setNewPassword(ev.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface focus:outline-none"
                      />
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gw-outline-var">
                        <span className={hasLength ? "text-gw-primary" : ""}>{hasLength ? "✓" : "○"}</span>
                        <span>At least 8 characters (UI rule only)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        className="text-[9px] uppercase tracking-widest text-gw-muted"
                        htmlFor="confirm-password"
                      >
                        Confirm new password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        minLength={8}
                        value={confirmPassword}
                        onChange={(ev) => setConfirmPassword(ev.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface focus:outline-none"
                      />
                      {!passwordsMatch ? (
                        <p className="mt-1 text-[11px] text-gw-muted">! Passwords do not match</p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={resetBusy || !hasLength || newPassword !== confirmPassword}
                      className="flex h-11 w-full items-center justify-center gap-2 bg-gw-primary px-4 text-[12px] font-medium uppercase tracking-widest text-gw-on-primary transition-colors hover:bg-gw-on disabled:opacity-60"
                    >
                      <span>{resetBusy ? "Opening profile…" : "Update password & continue"}</span>
                    </button>
                  </form>
                </div>

                <aside className="flex flex-col justify-between bg-gw-surface p-4 md:col-span-5">
                  <div className="flex flex-col gap-2">
                    <span className="font-gw-mono text-[9px] uppercase tracking-widest text-gw-primary">
                      Complexity criteria
                    </span>
                    <ul className="flex flex-col gap-1 text-[11px] text-gw-muted">
                      <li className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 ${hasLength ? "bg-gw-primary" : "bg-gw-outline-var"}`} />
                        <span>Minimum 8 characters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 ${hasMixed ? "bg-gw-primary" : "bg-gw-outline-var"}`} />
                        <span>Uppercase + numeral (preview)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-gw-outline-var" />
                        <span>Not persisted to any server</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 flex flex-col gap-1 bg-gw-surface-lowest p-2 pt-4">
                    <div className="flex items-center justify-between font-gw-mono text-[9px] text-gw-muted">
                      <span>Strength meter</span>
                      <span className={entropy.className}>{entropy.label}</span>
                    </div>
                    <div className="flex h-1 w-full bg-gw-surface-high">
                      <div
                        className="h-full bg-gw-primary transition-all duration-300"
                        style={{ width: `${entropy.score}%` }}
                      />
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-8 flex flex-col justify-between gap-1 border-t border-gw-outline-var/20 pt-2 font-gw-mono text-[9px] text-gw-outline-var sm:flex-row sm:items-center">
                <span>Addis Ababa · local gateway preview</span>
                <span className="text-gw-muted">No token expiry — nothing was issued</span>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
            <div className="flex flex-col gap-1 bg-gw-surface-low p-4">
              <span className="font-gw-mono text-[9px] uppercase text-gw-muted">Honest policy</span>
              <p className="text-[11px] text-gw-muted">
                Password reset email is not implemented. Accounts use email/password (hashed) or optional Google.
              </p>
            </div>
            <div className="flex flex-col gap-1 bg-gw-surface-low p-4">
              <span className="font-gw-mono text-[9px] uppercase text-gw-muted">No hardware auth</span>
              <p className="text-[11px] text-gw-muted">
                YubiKey / institutional PKI are not claimed. Use Sign in on the gateway.
              </p>
            </div>
            <div className="flex flex-col gap-1 bg-gw-surface-low p-4">
              <span className="font-gw-mono text-[9px] uppercase text-gw-muted">Support</span>
              <p className="text-[11px] text-gw-muted">
                No ops@hulum.org desk in v0.1. Prefer{" "}
                <Link href="/" className="text-gw-primary underline-offset-2 hover:underline">
                  sign in
                </Link>{" "}
                or{" "}
                <Link href="/verify" className="text-gw-primary underline-offset-2 hover:underline">
                  create account
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gw-outline-var/30 px-4 py-2 sm:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-2 text-[9px] text-gw-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-gw-primary">HULUM Decision Platform</span>
            <span>·</span>
            <span>Addis Ababa &amp; Global</span>
          </div>
          <nav className="flex items-center gap-3 uppercase tracking-wider" aria-label="Gateway">
            <Link href="/" className="transition-colors hover:text-gw-primary">
              Sign in
            </Link>
            <span className="text-gw-outline-var">·</span>
            <Link href="/journey" className="transition-colors hover:text-gw-primary">
              Journey
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
