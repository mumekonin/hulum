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
    <div className="flex min-h-screen flex-col justify-between">
      <header className="w-full border-b border-gw-outline-var/30">
        <div className="flex h-14 w-full items-center justify-between px-5 sm:px-8">
          <span className="font-gw-serif text-[19px] font-semibold tracking-wider text-gw-primary">HULUM</span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto grid w-full max-w-[480px] grid-cols-1 items-center gap-8 sm:gap-10 min-[880px]:max-w-none min-[880px]:w-auto min-[880px]:grid-cols-[minmax(0,420px)_380px] min-[880px]:gap-12 lg:grid-cols-[minmax(0,500px)_420px] lg:gap-16 xl:gap-[72px]">
          <div className="flex flex-col">
            <p className="hidden font-gw-serif text-3xl font-semibold tracking-tight text-gw-primary sm:block">HULUM</p>
            <h1 className="font-gw-serif text-[30px] leading-[36px] tracking-tight text-gw-primary sm:mt-3 sm:text-[34px] sm:leading-[40px]">
              Know what is worth your time.
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-gw-secondary">
              Find opportunities, understand your fit, and know exactly what to prepare before you apply.
            </p>

            <div className="mt-7 hidden w-full bg-gw-surface-low p-4 sm:block">
              <p className="text-[9px] uppercase tracking-widest text-gw-muted">Decision loop</p>
              <p className="mt-1.5 font-gw-serif text-[19px] text-gw-primary">APPLY / MAYBE / SKIP</p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-gw-muted">
                Engine decides · AI explains only
              </p>
            </div>

            <p className="mt-6 hidden text-[12px] leading-relaxed text-gw-muted sm:block">
              HULUM evaluates academic grants, international fellowships, and early-career appointments for Ethiopian
              students and professionals.
            </p>
          </div>

          <div className="flex w-full flex-col border border-gw-outline-var/60 bg-gw-surface p-7 sm:p-8">
                  <div className="mb-5">
                    <h2 className="font-gw-serif mb-1 text-2xl text-gw-primary">Welcome back.</h2>
                    <p className="text-[13px] leading-5 text-gw-secondary">Continue your opportunity journey.</p>
                  </div>

                  {notice ? (
                    <p className="mb-5 bg-gw-surface-highest px-4 py-3 text-[12px] font-medium leading-5 text-gw-primary" role="status">
                      {notice}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={triggerGoogle}
                    className="group flex h-11 w-full items-center justify-center gap-2 bg-gw-surface-high px-4 text-gw-primary transition-colors hover:bg-gw-surface-highest disabled:opacity-60"
                  >
                    {sim === "google-loading" ? (
                      <span className="h-4 w-4 animate-pulse rounded-full border border-gw-primary border-t-transparent" />
                    ) : (
                      <GoogleMark />
                    )}
                    <span className="text-[12px] font-medium uppercase tracking-wider">
                      {sim === "google-loading" ? "Checking…" : "Continue with Google"}
                    </span>
                  </button>

                  <div className="relative my-5 flex items-center justify-center">
                    <div className="h-px w-full bg-gw-surface-highest" />
                    <span className="absolute bg-gw-surface px-2 text-[9px] uppercase tracking-widest text-gw-outline">
                      Or
                    </span>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={signIn}>
                    <div className="flex flex-col gap-1">
                      <label
                        className="flex items-center justify-between text-[9px] uppercase tracking-widest text-gw-secondary"
                        htmlFor="gateway-email"
                      >
                        <span>Email address</span>
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
                        className="h-11 w-full bg-gw-surface-lowest px-4 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[9px]">
                        <label className="uppercase tracking-widest text-gw-secondary" htmlFor="gateway-password">
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="lowercase tracking-wider text-gw-muted transition-colors hover:text-gw-primary"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="gateway-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          minLength={8}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(ev) => setPassword(ev.target.value)}
                          className="h-11 w-full bg-gw-surface-lowest pl-4 pr-16 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-gw-outline transition-colors hover:text-gw-primary"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <p className="text-[9px] text-gw-outline">At least 8 characters. Stored as a hash, never as plaintext.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="mt-2 flex h-11 w-full items-center justify-center gap-2 bg-gw-primary text-[12px] font-medium uppercase tracking-wider text-gw-on-primary transition-colors hover:bg-gw-on disabled:opacity-60"
                    >
                      {sim === "submit-loading" && busy ? (
                        <span className="h-4 w-4 animate-pulse rounded-full border border-gw-on-primary border-t-transparent" />
                      ) : null}
                      <span>{busy ? "Signing in…" : "Sign in"}</span>
                    </button>
                  </form>

                  <div className="mt-6 flex items-center justify-center gap-1 border-t border-gw-outline-var/20 pt-4 text-[11px] text-gw-muted">
                    <span>Don&apos;t have an account?</span>
                    <Link
                      href="/verify"
                      className="text-[9px] font-medium uppercase tracking-wide text-gw-primary transition-colors hover:text-gw-secondary"
                    >
                      Create account
                    </Link>
                  </div>

                  <p className="mt-3 text-center text-[11px] text-gw-muted">
                    Prefer the product map?{" "}
                    <Link href="/journey" className="text-gw-primary underline-offset-2 hover:underline">
                      Open journey
                    </Link>
                  </p>
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
          <nav className="flex items-center gap-3 uppercase tracking-wider" aria-label="Legal">
            <Link href="/journey" className="transition-colors hover:text-gw-primary">
              Journey
            </Link>
            <span className="text-gw-outline-var">·</span>
            <span className="text-gw-outline-var">Privacy / Terms not published yet</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
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
