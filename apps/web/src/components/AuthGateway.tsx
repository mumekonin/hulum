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

  const statusLabel =
    sim === "google-loading"
      ? "HANDSHAKE"
      : sim === "submit-loading"
        ? "EVALUATING"
        : sim === "error" || sim === "notice"
          ? "NOTICE"
          : "STABLE";

  const statusMuted = sim === "error" || sim === "notice";

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <header className="w-full border-b border-gw-outline-var/30">
        <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.16em]">
            <span className="font-gw-serif text-[19px] font-semibold tracking-wider text-gw-primary normal-case">
              HULUM
            </span>
            <span className="text-gw-outline-var">/</span>
            <span className="text-gw-muted tracking-widest">Decision system [AUTH_NODE_01]</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest text-gw-muted">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-gw-primary" aria-hidden />
              <span>Gateway active</span>
            </div>
            <span className="hidden sm:inline">9.0249° N, 38.7469° E</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="flex w-full flex-col">
          <div className="mx-auto w-full max-w-7xl px-0 py-8 lg:py-10">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="flex flex-col justify-center lg:col-span-6 lg:pr-8">
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gw-secondary">
                    <span>Index: archive // 2025.1</span>
                    <span className="text-gw-outline-var">/</span>
                    <span>Verified access</span>
                  </div>
                  <p className="font-gw-serif text-3xl font-semibold tracking-tight text-gw-primary">HULUM</p>
                </div>

                <div className="mb-8 flex flex-col gap-4">
                  <h1 className="font-gw-serif max-w-lg text-[32px] leading-[38px] tracking-tight text-gw-primary sm:text-[34px] sm:leading-[38px]">
                    Know what is worth your time.
                  </h1>
                  <p className="max-w-md text-[15px] leading-6 text-gw-secondary">
                    Find opportunities, understand your fit, and know exactly what to prepare before you apply.
                  </p>
                </div>

                <div className="mb-8 w-full max-w-md bg-gw-surface-low p-4">
                  <div className="mb-2 flex items-center justify-between pb-1 text-[9px] uppercase tracking-widest text-gw-muted">
                    <span>Decision loop</span>
                    <span className="font-gw-mono text-gw-primary">Local · v0.1</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 py-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-gw-serif text-[19px] text-gw-primary">APPLY / MAYBE / SKIP</span>
                      <span className="text-[9px] uppercase tracking-widest text-gw-muted">
                        Engine decides · AI explains only
                      </span>
                    </div>
                    <div className="flex h-9 w-32 items-end gap-1 pb-1" aria-hidden>
                      <div className="h-3 flex-1 bg-gw-surface-highest" />
                      <div className="h-4 flex-1 bg-gw-surface-highest" />
                      <div className="h-6 flex-1 bg-gw-surface-highest" />
                      <div className="h-5 flex-1 bg-gw-surface-highest" />
                      <div className="h-7 flex-1 bg-gw-surface-high" />
                      <div className="h-8 flex-1 bg-gw-secondary" />
                      <div className="h-9 flex-1 bg-gw-primary" />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between pt-1 text-[9px] text-gw-outline">
                    <span>Synthesis: profile × curated catalog</span>
                    <span>No fake precision %</span>
                  </div>
                </div>

                <div className="max-w-md bg-gw-surface-lowest/60 p-4">
                  <div className="flex items-start gap-2">
                    <span className="pt-0.5 text-[9px] uppercase tracking-widest text-gw-secondary">Note</span>
                    <p className="text-[11px] italic leading-relaxed text-gw-muted">
                      HULUM evaluates academic grants, international fellowships, and early-career appointments for
                      Ethiopian students and professionals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:col-span-6 lg:justify-end">
                <div className="relative flex w-full max-w-[480px] flex-col border border-gw-outline-var/60 bg-gw-surface p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between pb-2 text-[9px] text-gw-muted">
                    <div className="flex items-center gap-1">
                      <span className="font-gw-mono font-medium text-gw-primary">REF: 849-AUTH</span>
                      <span className="text-gw-outline-var">/</span>
                      <span className="uppercase tracking-widest">Gateway</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`h-1.5 w-1.5 ${statusMuted ? "bg-gw-secondary" : "bg-gw-primary"}`}
                        aria-hidden
                      />
                      <span
                        className={`uppercase tracking-widest ${statusMuted ? "text-gw-secondary" : "text-gw-primary"}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="font-gw-serif mb-1 text-2xl text-gw-primary">Welcome back.</h2>
                    <p className="text-[13px] leading-5 text-gw-secondary">Continue your opportunity journey.</p>
                  </div>

                  {notice ? (
                    <div className="mb-6 bg-gw-surface-highest p-4" role="status">
                      <div className="flex items-start gap-2">
                        <span className="pt-0.5 font-gw-mono text-[9px] text-gw-secondary">! MSG //</span>
                        <div className="flex-1">
                          <p className="text-[11px] font-medium leading-4 text-gw-primary">{notice}</p>
                          <p className="mt-0.5 text-[9px] text-gw-muted">
                            Google and email/password both issue a JWT. Password reset is not wired yet.
                          </p>
                        </div>
                      </div>
                    </div>
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

                  <div className="relative my-6 flex items-center justify-center">
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
                        <span className="font-gw-mono text-gw-outline-var">Required</span>
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
                        className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
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
                          className="w-full bg-gw-surface-lowest px-4 py-2 pr-10 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
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

                  <div className="mt-4 flex items-center justify-between pt-1 text-[9px] uppercase tracking-widest text-gw-outline-var">
                    <span>Email + password · hashed · session token</span>
                    <span>Sys // v0.1</span>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-gw-muted">
                    Prefer the product map?{" "}
                    <Link href="/journey" className="text-gw-primary underline-offset-2 hover:underline">
                      Open journey
                    </Link>
                  </p>
                </div>
              </div>
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
