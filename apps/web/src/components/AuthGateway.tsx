"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@hulum/shared";
import { API_URL, api, userFacingError } from "@/lib/api";
import { routeAfterAuth } from "@/lib/post-auth";
import { isSignedIn, persistAuthSession } from "@/lib/storage";
import {
  AuthHeading,
  AuthNotice,
  AuthShell,
  authInputClass as inputClass,
  authLabelClass as labelClass,
  authPrimaryButtonClass,
  authTextLinkClass,
} from "./AuthShell";

type SimState = "idle" | "google-loading" | "submit-loading" | "error" | "notice";

const EMAIL_KEY = "hulum.gatewayEmail";

export function AuthGateway() {
  const router = useRouter();
  const [sim, setSim] = useState<SimState>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isSignedIn()) {
      void routeAfterAuth(router);
      return;
    }
    const error = new URLSearchParams(window.location.search).get("auth_error");
    if (error === "google_denied") {
      setSim("error");
      setNotice("Google sign-in was cancelled.");
    } else if (error === "google_failed") {
      setSim("error");
      setNotice("Google sign-in failed. Try again, or use email and password.");
    } else if (error === "google_unconfigured") {
      setSim("error");
      setNotice("Google sign-in isn't available yet. Use email and password for now.");
    }
  }, [router]);

  function triggerGoogle() {
    setSim("google-loading");
    setNotice(null);
    window.location.assign(`${API_URL}/api/auth/google`);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSim("submit-loading");
    setNotice(null);
    try {
      const session = await api<AuthSession>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persistAuthSession(session);
      window.localStorage.setItem(EMAIL_KEY, session.email);
      await routeAfterAuth(router);
    } catch (error) {
      setBusy(false);
      setSim("error");
      setNotice(userFacingError(error));
    }
  }

  return (
    <AuthShell>
      <AuthHeading title="Welcome back." subtitle="Continue your opportunity journey." />

      {notice ? <AuthNotice className="mt-6">{notice}</AuthNotice> : null}

      <button
        type="button"
        disabled={busy}
        onClick={triggerGoogle}
        className="auth-google hulum-btn hulum-btn-secondary mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface text-[14px] font-semibold text-ink hover:bg-surface-muted disabled:opacity-60"
      >
        {sim === "google-loading" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-primary border-t-transparent" />
        ) : (
          <GoogleMark />
        )}
        <span>{sim === "google-loading" ? "Redirecting to Google…" : "Continue with Google"}</span>
      </button>

      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="font-gw-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={signIn}>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="gateway-email">
            Email address
          </label>
          <input
            id="gateway-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@domain.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="gateway-password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className={`${authTextLinkClass} text-[13px] font-medium text-gw-muted hover:text-gw-primary`}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="gateway-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className={`${inputClass} pr-16`}
            />
            <button
              type="button"
              className="auth-reveal absolute inset-y-0 right-0 px-3.5 text-[13px] font-medium text-gw-muted hover:text-gw-primary"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={busy} className={`mt-1.5 ${authPrimaryButtonClass}`}>
          {sim === "submit-loading" && busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
          ) : null}
          <span>{busy ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-gw-muted">
        Don&apos;t have an account?{" "}
        <Link href="/verify" className={`${authTextLinkClass} font-semibold text-gw-primary`}>
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
        fillOpacity={0.75}
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="currentColor"
        fillOpacity={0.5}
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="currentColor"
      />
    </svg>
  );
}
