"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { PASSWORD_MIN_LENGTH } from "@hulum/shared";
import { ApiClientError, NETWORK_MESSAGE, api } from "@/lib/api";
import {
  GENERIC_RESET_ERROR,
  RESET_LINK_EXPIRED_MESSAGE,
  RESET_LINK_INVALID_MESSAGE,
  newPasswordError,
  readResetTokenFromHash,
  resetLinkProblem,
  type ResetLinkProblem,
} from "@/lib/password-reset";
import { clearSession } from "@/lib/storage";
import {
  AuthHeading,
  AuthNotice,
  AuthShell,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authTextLinkClass,
} from "./AuthShell";

type Phase =
  | { kind: "checking" }
  | { kind: "check-failed"; message: string }
  | { kind: "link-problem"; problem: ResetLinkProblem }
  | { kind: "form" }
  | { kind: "updating" }
  | { kind: "done" };

const REDIRECT_DELAY_MS = 5000;

function apiError(error: unknown): ApiClientError | undefined {
  return error instanceof ApiClientError ? error : undefined;
}

export function AuthResetPassword() {
  const router = useRouter();
  const token = useRef<string | null | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>({ kind: "checking" });
  const [checkKey, setCheckKey] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token.current === undefined) {
      token.current = readResetTokenFromHash(window.location.hash);
      if (window.location.hash !== "") {
        // Keep the token out of browser history and anything copied from the address bar.
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
    const value = token.current;
    if (value === null) {
      setPhase({ kind: "link-problem", problem: "invalid" });
      return;
    }
    let cancelled = false;
    setPhase({ kind: "checking" });
    void api<{ status: "valid" }>("/api/auth/password-reset/verify", {
      method: "POST",
      body: JSON.stringify({ token: value }),
    })
      .then(() => {
        if (!cancelled) setPhase({ kind: "form" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const problem = resetLinkProblem(apiError(err));
        if (problem !== undefined) {
          setPhase({ kind: "link-problem", problem });
          return;
        }
        setPhase({
          kind: "check-failed",
          message: apiError(err)?.code === "NETWORK" ? NETWORK_MESSAGE : GENERIC_RESET_ERROR,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [checkKey]);

  useEffect(() => {
    if (phase.kind !== "done") return;
    const timer = window.setTimeout(() => router.push("/sign-in"), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase.kind, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (phase.kind !== "form") return;
    const problem = newPasswordError(password, confirm);
    if (problem !== null) {
      setError(problem);
      return;
    }
    const value = token.current;
    if (value === null || value === undefined) {
      setPhase({ kind: "link-problem", problem: "invalid" });
      return;
    }
    setError(null);
    setPhase({ kind: "updating" });
    try {
      await api<{ status: "updated" }>("/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token: value, password }),
      });
      token.current = null;
      setPassword("");
      setConfirm("");
      // Any session in this browser predates the new password; sign in again with it.
      clearSession();
      setPhase({ kind: "done" });
    } catch (err) {
      const linkProblem = resetLinkProblem(apiError(err));
      if (linkProblem !== undefined) {
        setPhase({ kind: "link-problem", problem: linkProblem });
        return;
      }
      const failure = apiError(err);
      setPhase({ kind: "form" });
      setError(
        failure?.code === "INVALID_INPUT" || failure?.code === "RATE_LIMITED"
          ? failure.message
          : failure?.code === "NETWORK"
            ? NETWORK_MESSAGE
            : GENERIC_RESET_ERROR,
      );
    }
  }

  if (phase.kind === "checking") {
    return (
      <AuthShell>
        <AuthHeading title="Reset your password." subtitle="Checking your reset link…" />
      </AuthShell>
    );
  }

  if (phase.kind === "check-failed") {
    return (
      <AuthShell>
        <AuthHeading title="Reset your password." subtitle="We couldn't check your reset link." />
        <AuthNotice className="mt-6">{phase.message}</AuthNotice>
        <button
          type="button"
          onClick={() => setCheckKey((value) => value + 1)}
          className={`mt-7 ${authPrimaryButtonClass}`}
        >
          Try again
        </button>
      </AuthShell>
    );
  }

  if (phase.kind === "link-problem") {
    return (
      <AuthShell>
        <AuthHeading title="Reset your password." subtitle="This reset link can't be used." />
        <AuthNotice className="mt-6">
          {phase.problem === "expired" ? RESET_LINK_EXPIRED_MESSAGE : RESET_LINK_INVALID_MESSAGE}
        </AuthNotice>
        <Link href="/forgot-password" className={`mt-7 ${authPrimaryButtonClass}`}>
          Request a new link
        </Link>
        <p className="mt-6 text-center text-[14px] text-gw-muted">
          <Link
            href="/sign-in"
            className={`${authTextLinkClass} font-semibold text-ink`}
          >
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (phase.kind === "done") {
    return (
      <AuthShell>
        <AuthHeading
          title="Reset your password."
          subtitle="Choose a new password for your HULUM account."
        />
        <AuthNotice className="mt-6">
          Password updated successfully. Sign in with your new password. Taking you to sign in
          shortly.
        </AuthNotice>
        <button type="button" disabled className={`mt-7 ${authPrimaryButtonClass}`}>
          Password updated
        </button>
        <Link
          href="/sign-in"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg border border-[#d9d6d0] text-[14px] font-semibold text-gw-primary transition-colors hover:border-[#bfbcb5] dark:border-[#333] dark:hover:border-[#444]"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  const updating = phase.kind === "updating";
  const inputType = showPassword ? "text" : "password";

  return (
    <AuthShell>
      <AuthHeading
        title="Reset your password."
        subtitle="Choose a new password for your HULUM account."
      />

      {error ? (
        <AuthNotice className="mt-6">
          <span id="reset-password-error">{error}</span>
        </AuthNotice>
      ) : null}

      <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="reset-password">
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              name="password"
              type={inputType}
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              placeholder={`At least ${String(PASSWORD_MIN_LENGTH)} characters`}
              value={password}
              readOnly={updating}
              aria-invalid={error !== null}
              aria-describedby={error ? "reset-password-error" : undefined}
              onChange={(ev) => setPassword(ev.target.value)}
              className={`${authInputClass} pr-16`}
            />
            <button
              type="button"
              className="auth-reveal absolute inset-y-0 right-0 px-3.5 text-[13px] font-medium text-muted hover:text-ink"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="reset-password-confirm">
            Confirm new password
          </label>
          <input
            id="reset-password-confirm"
            name="confirmPassword"
            type={inputType}
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            placeholder="Type it again"
            value={confirm}
            readOnly={updating}
            aria-invalid={error !== null}
            aria-describedby={error ? "reset-password-error" : undefined}
            onChange={(ev) => setConfirm(ev.target.value)}
            className={authInputClass}
          />
        </div>

        <button type="submit" disabled={updating} className={`mt-1.5 ${authPrimaryButtonClass}`}>
          {updating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
          ) : null}
          <span>{updating ? "Updating…" : "Update password"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-gw-muted">
        <Link
          href="/sign-in"
          className={`${authTextLinkClass} font-semibold text-ink`}
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
