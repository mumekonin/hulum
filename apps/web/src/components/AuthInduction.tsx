"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { routeAfterAuth } from "@/lib/post-auth";
import { isSignedIn, persistAuthSession } from "@/lib/storage";
import {
  AuthHeading,
  AuthNotice,
  AuthShell,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "./AuthShell";

const EMAIL_KEY = "hulum.gatewayEmail";

const REGISTER_HONESTY =
  "This page creates your account with email and password (JWT). The URL is /verify for history only—there is no email verification code or OTP step.";

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
      void routeAfterAuth(router);
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
      await routeAfterAuth(router);
    } catch (error) {
      setBusy(false);
      setNotice(userFacingError(error));
    }
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Create your account."
        subtitle="Register with email and password—no verification code step."
      />

      <AuthNotice className="mt-6">{REGISTER_HONESTY}</AuthNotice>

      {notice ? <AuthNotice className="mt-4">{notice}</AuthNotice> : null}

      <form className="mt-7 flex flex-col gap-4" onSubmit={createAccount}>
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="register-name">
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
            className={authInputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="register-email">
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
            className={authInputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="register-password">
            Password
          </label>
          <div className="relative">
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
              className={`${authInputClass} pr-16`}
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

        <button type="submit" disabled={busy} className={`mt-1.5 ${authPrimaryButtonClass}`}>
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gw-on-primary border-t-transparent" />
          ) : null}
          <span>{busy ? "Creating account…" : "Create account"}</span>
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-gw-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-gw-primary underline-offset-2 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
