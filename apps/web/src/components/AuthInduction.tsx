"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { isSignedIn, persistAuthSession } from "@/lib/storage";

const EMAIL_KEY = "hulum.gatewayEmail";

export function AuthInduction() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn()) {
      router.replace("/profile");
    }
    const stored = window.localStorage.getItem(EMAIL_KEY)?.trim();
    if (stored) setEmail(stored);
  }, [router]);

  async function createAccount(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const session = await api<AuthSession>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      persistAuthSession(session);
      window.localStorage.setItem(EMAIL_KEY, session.email);
      router.push("/profile");
    } catch (error) {
      setBusy(false);
      setNotice(userFacingError(error));
    }
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
        <div className="mx-auto w-full max-w-md">
          <div className="flex flex-col bg-gw-surface p-6 shadow-md sm:p-8">
            <div className="mb-6 flex items-center justify-between pb-2 text-[9px] text-gw-muted">
              <span className="font-gw-mono font-medium text-gw-primary">REF: 849-AUTH</span>
              <span className="uppercase tracking-widest">Create account</span>
            </div>
            <h1 className="font-gw-serif mb-1 text-2xl text-gw-primary">Create your account.</h1>
            <p className="mb-6 text-[13px] leading-5 text-gw-secondary">
              Email and password. The password is hashed on the server. Google sign-in is on the sign-in page.
            </p>

            {notice ? (
              <div className="mb-6 bg-gw-surface-highest p-4" role="status">
                <p className="text-[11px] font-medium leading-4 text-gw-primary">{notice}</p>
              </div>
            ) : null}

            <form className="flex flex-col gap-4" onSubmit={createAccount}>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gw-secondary" htmlFor="register-name">
                  Full name
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Abeba Tesfaye"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gw-secondary" htmlFor="register-email">
                  Email address
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="w-full bg-gw-surface-lowest px-4 py-2 text-[13px] text-gw-primary placeholder:text-gw-outline-var focus:bg-gw-surface-low focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-widest text-gw-secondary" htmlFor="register-password">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 bg-gw-primary text-[12px] font-medium uppercase tracking-wider text-gw-on-primary transition-colors hover:bg-gw-on disabled:opacity-60"
              >
                <span>{busy ? "Creating account…" : "Create account"}</span>
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-1 border-t border-gw-outline-var/20 pt-4 text-[11px] text-gw-muted">
              <span>Already have an account?</span>
              <Link href="/" className="text-[9px] font-medium uppercase tracking-wide text-gw-primary hover:text-gw-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gw-outline-var/30 px-4 py-2 sm:px-8">
        <div className="flex w-full flex-col items-center justify-between gap-2 text-[9px] text-gw-muted sm:flex-row">
          <span className="text-gw-primary">HULUM Decision Platform</span>
          <Link href="/" className="uppercase tracking-wider hover:text-gw-primary">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
