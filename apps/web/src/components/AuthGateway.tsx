"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@hulum/shared";
import { API_URL, api, userFacingError } from "@/lib/api";
import { routeAfterAuth } from "@/lib/post-auth";
import { isSignedIn, persistAuthSession } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";

type SimState = "idle" | "google-loading" | "submit-loading" | "error" | "notice";

const EMAIL_KEY = "hulum.gatewayEmail";

const inputClass =
  "h-12 w-full rounded-lg border border-[#e2e0db] bg-white px-3.5 font-sans text-[15px] text-gw-primary placeholder:text-[#a9a69f] transition-colors hover:border-[#cfccc5] focus:border-gw-primary focus:outline-none dark:border-[#2a2a2a] dark:bg-[#0f0f0f] dark:placeholder:text-[#5f5d58] dark:hover:border-[#3a3a3a]";

const labelClass = "font-gw-mono text-[11px] uppercase tracking-[0.08em] text-gw-muted";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafaf8] px-4 pb-8 pt-16 font-sans sm:px-6 md:py-16 dark:bg-[#0b0b0b]">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-5">
        <ThemeToggle />
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="grid w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[#e7e5e0] bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04),0_8px_24px_-12px_rgba(20,20,20,0.08)] md:max-w-[960px] md:grid-cols-[46fr_54fr] md:min-h-[580px] dark:border-[#2a2a2a] dark:bg-[#141414] dark:shadow-none"
      >
        <section className="flex flex-col items-center justify-center border-b border-[#ecebe6] bg-[#f6f5f2] px-8 py-6 text-center md:border-b-0 md:border-r md:px-12 md:py-12 dark:border-[#232323] dark:bg-[#101010]">
          <HulumMark />
          <p className="mt-4 font-gw-mono text-[12px] font-medium uppercase tracking-[0.28em] text-gw-primary md:mt-6">
            HULUM
          </p>
          <h1 className="mt-3 max-w-[340px] text-balance font-gw-serif text-[26px] leading-[1.12] tracking-tight text-gw-primary md:mt-5 md:text-[36px]">
            Know what is worth your time.
          </h1>
          <p className="mt-4 hidden max-w-[300px] text-[15px] leading-[1.65] text-gw-muted sm:block md:mt-6">
            Understand opportunities.
            <br />
            Know where you stand.
            <br />
            Apply with confidence.
          </p>
        </section>

        <section className="flex flex-col justify-center px-6 py-7 sm:px-10 md:px-11 md:py-12">
          <div className="text-center">
            <h2 className="font-gw-serif text-[28px] leading-tight text-gw-primary md:text-[32px]">Welcome back.</h2>
            <p className="mt-2 text-[15px] text-gw-muted">Continue your opportunity journey.</p>
          </div>

          {notice ? (
            <p
              className="mt-6 rounded-lg border border-[#e2e0db] bg-[#f6f5f2] px-4 py-3 text-[13px] leading-5 text-gw-primary dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
              role="status"
            >
              {notice}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={triggerGoogle}
            className="mt-7 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#d9d6d0] bg-white text-[14px] font-semibold text-gw-primary transition-colors hover:border-[#bfbcb5] hover:bg-[#f6f5f2] disabled:opacity-60 dark:border-[#333] dark:bg-[#1a1a1a] dark:hover:border-[#444] dark:hover:bg-[#202020]"
          >
            {sim === "google-loading" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-primary border-t-transparent" />
            ) : (
              <GoogleMark />
            )}
            <span>{sim === "google-loading" ? "Redirecting to Google…" : "Continue with Google"}</span>
          </button>

          <div className="my-5 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#ecebe6] dark:bg-[#262626]" />
            <span className="font-gw-mono text-[10px] uppercase tracking-[0.2em] text-[#9a978f] dark:text-[#6b6964]">
              or
            </span>
            <span className="h-px flex-1 bg-[#ecebe6] dark:bg-[#262626]" />
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
                  className="text-[13px] text-gw-muted underline-offset-2 transition-colors hover:text-gw-primary hover:underline"
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
                  className="absolute inset-y-0 right-0 px-3.5 text-[13px] font-medium text-gw-muted transition-colors hover:text-gw-primary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gw-primary text-[14px] font-semibold text-gw-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sim === "submit-loading" && busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
              ) : null}
              <span>{busy ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-gw-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/verify"
              className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
            >
              Create account
            </Link>
          </p>
        </section>
      </main>

      <p className="mt-5 text-center text-[13px] text-gw-muted md:mt-6">
        New to HULUM?{" "}
        <Link href="/journey" className="text-gw-primary underline underline-offset-2 hover:opacity-80">
          See how it works
        </Link>
      </p>
    </div>
  );
}

function HulumMark() {
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gw-primary font-gw-serif text-[28px] font-semibold leading-none text-gw-on-primary md:h-16 md:w-16 md:rounded-[16px] md:text-[38px]"
    >
      H
    </span>
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
