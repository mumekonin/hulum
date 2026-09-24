"use client";

import Link from "next/link";
import { ClipboardEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requireUserId } from "@/lib/storage";

const EMAIL_KEY = "hulum.gatewayEmail";
const DEMO_CODE = "849201";

type Stage = "verify" | "success";

export function AuthInduction() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("verify");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [statusMsg, setStatusMsg] = useState("Awaiting input… (no email OTP is sent in v0.1)");
  const [statusError, setStatusError] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("local-session@hulum.demo");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const scholarName = useMemo(() => {
    const local = email.split("@")[0] ?? "scholar";
    return local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Local Scholar";
  }, [email]);

  useEffect(() => {
    const stored = window.localStorage.getItem(EMAIL_KEY)?.trim();
    if (stored) setEmail(stored);
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendSeconds]);

  const code = digits.join("");
  const codeComplete = code.length === 6 && digits.every((d) => d !== "");

  function setDigitAt(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = cleaned;
      return next;
    });
    setStatusError(false);
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (cleaned) {
      const preview = digits.map((d, i) => (i === index ? cleaned : d)).join("");
      if (preview.length === 6 && !preview.includes("")) {
        setStatusMsg("Token complete (UI only). Demo accept: 849201 — or any 6 digits for local continue.");
      } else {
        setStatusMsg("Awaiting input… (no email OTP is sent in v0.1)");
      }
    }
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = ["", "", "", "", "", ""];
    paste.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    setStatusError(false);
    setStatusMsg(
      paste.length === 6
        ? "Token complete (UI only). Verify continues with a local UUID session."
        : "Awaiting input… (no email OTP is sent in v0.1)",
    );
    inputsRef.current[Math.min(paste.length, 5)]?.focus();
  }

  function demoFill() {
    setDigits(DEMO_CODE.split(""));
    setStatusError(false);
    setStatusMsg("Demo code filled. Verify continues locally — nothing was emailed.");
    inputsRef.current[5]?.focus();
  }

  function handleVerify() {
    if (!codeComplete) {
      setStatusError(true);
      setStatusMsg("! Enter all 6 digits (UI gate only).");
      inputsRef.current[0]?.focus();
      return;
    }
    setStage("success");
  }

  function beginProfile() {
    setBusy(true);
    try {
      requireUserId();
      router.push("/profile");
    } catch {
      setBusy(false);
      setStage("verify");
      setStatusError(true);
      setStatusMsg("Could not start a local session. Return to sign in and use Continue.");
    }
  }

  function resendNotice() {
    setResendSeconds(60);
    setStatusError(false);
    setStatusMsg("Resend is not wired in v0.1 — no email was sent. Use demo fill or any 6 digits.");
  }

  const timerLabel =
    resendSeconds <= 0 ? "ready" : `00:${resendSeconds < 10 ? `0${resendSeconds}` : resendSeconds}`;

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
          <div className="flex flex-col justify-between gap-4 border-b border-gw-outline-var/20 pb-2 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1 text-[9px] uppercase tracking-widest text-gw-muted">
                <span className="h-1.5 w-1.5 bg-gw-primary" aria-hidden />
                <span>Protocol // preview</span>
                <span className="text-gw-outline-var">/</span>
                <span>Local induction · no mail OTP</span>
              </div>
              <p className="font-gw-serif text-[19px] tracking-tight text-gw-primary">
                Access gate &amp; induction sequence
              </p>
            </div>
            <div className="flex items-center border border-gw-outline-var/30 bg-gw-surface-lowest p-0.5 text-[9px]">
              <button
                type="button"
                onClick={() => setStage("verify")}
                className={`px-4 py-1.5 transition-all ${
                  stage === "verify"
                    ? "bg-gw-surface-high font-medium text-gw-on"
                    : "text-gw-muted hover:text-gw-on"
                }`}
              >
                [ 01: OTP verification ]
              </button>
              <button
                type="button"
                onClick={() => setStage("success")}
                className={`px-4 py-1.5 transition-all ${
                  stage === "success"
                    ? "bg-gw-surface-high font-medium text-gw-on"
                    : "text-gw-muted hover:text-gw-on"
                }`}
              >
                [ 02: Admission success ]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <aside className="flex flex-col gap-6 lg:col-span-4">
              <div className="flex flex-col gap-4 border border-gw-outline-var/20 bg-gw-surface-low p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gw-outline-var/20 pb-1 text-[9px] uppercase text-gw-muted">
                  <span>Security perimeter</span>
                  <span className="text-[11px] text-gw-primary">NODE_PREVIEW</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-gw-outline">Designated scholar</span>
                  <span className="text-[13px] text-gw-on">{scholarName}</span>
                  <span className="truncate text-[11px] text-gw-muted">{email}</span>
                </div>
                <div className="h-px w-full bg-gw-outline-var/20" />
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-gw-outline">Session mode</span>
                  <span className="text-[13px] text-gw-on">Local UUID · v0.1</span>
                  <span className="text-[11px] text-gw-muted">No institutional IdP connected</span>
                </div>
                <div className="h-px w-full bg-gw-outline-var/20" />
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center justify-between text-[9px] uppercase text-gw-outline">
                    <span>Preview fingerprint</span>
                    <span>UI only</span>
                  </div>
                  <div className="break-all border border-gw-outline-var/20 bg-gw-surface-lowest p-2 font-gw-mono text-[11px] leading-tight text-gw-muted/80">
                    local::session::not-a-real-sha256::v0.1
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 border border-gw-outline-var/15 bg-gw-surface-lowest px-4 py-2 text-gw-muted">
                <span className="select-none text-gw-outline" aria-hidden>
                  i
                </span>
                <p className="text-[11px] leading-relaxed">
                  HULUM v0.1 does not email OTP codes. This screen is an induction UI preview; Continue / Verify
                  still uses a browser UUID and opens Profile.
                </p>
              </div>
            </aside>

            <div className="flex flex-col lg:col-span-8">
              {stage === "verify" ? (
                <section className="flex flex-col gap-6 border border-gw-outline-var/30 bg-gw-surface-low p-6 shadow-sm sm:p-8">
                  <div className="flex items-center justify-between border-b border-gw-outline-var/20 pb-1 text-[9px] uppercase tracking-wider text-gw-muted">
                    <span>Docket stage // 01.A</span>
                    <span className="flex items-center gap-1 text-gw-primary">
                      <span className="h-1.5 w-1.5 animate-pulse bg-gw-primary" aria-hidden />
                      Awaiting UI handshake
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h1 className="font-gw-serif text-[34px] leading-[38px] font-normal text-gw-primary sm:text-[48px] sm:leading-[52px]">
                      Check your inbox.
                    </h1>
                    <p className="max-w-xl text-[13px] leading-5 text-gw-muted">
                      In a future release a 6-digit code would go to{" "}
                      <span className="text-gw-primary underline decoration-gw-outline-var underline-offset-4">
                        {email}
                      </span>
                      . Today, use demo fill or type any 6 digits — nothing is emailed.
                    </p>
                  </div>

                  <div className="my-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] uppercase tracking-wider text-gw-outline" htmlFor="otp-0">
                        Six-digit authentication token
                      </label>
                      <span className="text-[9px] text-gw-muted/70">Auto-advance enabled</span>
                    </div>
                    <div className="grid max-w-md grid-cols-6 gap-2 sm:gap-4">
                      {digits.map((digit, index) => (
                        <input
                          key={index}
                          id={index === 0 ? "otp-0" : undefined}
                          ref={(el) => {
                            inputsRef.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          autoComplete="one-time-code"
                          value={digit}
                          onChange={(ev) => setDigitAt(index, ev.target.value)}
                          onKeyDown={(ev) => onKeyDown(index, ev)}
                          onPaste={onPaste}
                          className="h-14 w-full border border-gw-outline-var/40 bg-gw-surface-lowest text-center font-gw-serif text-[19px] text-gw-primary transition-colors focus:border-gw-primary focus:outline-none"
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-[11px] ${statusError ? "text-gw-muted" : "text-gw-muted/60"} ${codeComplete && !statusError ? "text-gw-primary" : ""}`}
                      role="status"
                    >
                      {statusMsg}
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-4 pt-1 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleVerify}
                      className="flex items-center justify-center gap-1 bg-gw-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-gw-on-primary transition-colors hover:bg-gw-on"
                    >
                      <span>Verify &amp; establish session</span>
                      <span aria-hidden>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={demoFill}
                      className="border border-gw-outline-var/30 bg-gw-surface px-4 py-3 text-[9px] uppercase tracking-wider text-gw-on transition-colors hover:text-gw-primary"
                    >
                      [ Demo auto-fill: {DEMO_CODE} ]
                    </button>
                  </div>

                  <div className="flex flex-col justify-between gap-2 border-t border-gw-outline-var/20 pt-4 text-[9px] text-gw-muted sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={resendNotice}
                      className="text-left transition-colors hover:text-gw-primary"
                    >
                      Resend verification link ({timerLabel})
                    </button>
                    <span className="hidden text-gw-outline-var/40 sm:inline">·</span>
                    <Link href="/" className="transition-colors hover:text-gw-primary hover:underline">
                      Use a different email address
                    </Link>
                    <span className="hidden text-gw-outline-var/40 sm:inline">·</span>
                    <span className="text-gw-outline">No registrar desk in v0.1</span>
                  </div>
                </section>
              ) : (
                <section className="flex flex-col gap-6 border border-gw-outline-var/30 bg-gw-surface-low p-6 shadow-sm sm:p-8">
                  <div className="flex items-center justify-between border-b border-gw-outline-var/20 pb-1 text-[9px] uppercase tracking-wider text-gw-muted">
                    <span>Docket stage // 02.complete</span>
                    <span className="flex items-center gap-1 font-medium text-gw-primary">
                      <span aria-hidden>✓</span>
                      Local session ready
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 bg-gw-primary" aria-hidden />
                      <h1 className="font-gw-serif text-[34px] leading-[38px] font-normal text-gw-primary sm:text-[48px] sm:leading-[52px]">
                        You&apos;re in.
                      </h1>
                    </div>
                    <p className="font-gw-serif text-[19px] font-normal text-gw-muted">
                      Let&apos;s build your opportunity profile.
                    </p>
                  </div>

                  <div className="my-1 flex flex-col gap-4 border border-gw-outline-var/30 bg-gw-surface-lowest p-6">
                    <div className="flex items-center justify-between border-b border-gw-outline-var/20 pb-1">
                      <span className="text-[9px] uppercase tracking-wider text-gw-outline">
                        Readiness path (product)
                      </span>
                      <span className="text-[9px] text-gw-primary">Next: Profile</span>
                    </div>
                    <div className="flex items-start gap-4 rounded border border-gw-outline-var/40 bg-gw-surface-low/70 p-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-gw-primary text-[9px] font-semibold text-gw-on-primary">
                        1
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-gw-primary">Create or update profile</span>
                          <span className="border border-gw-outline-var/30 bg-gw-surface px-1 py-0.5 text-[9px] text-gw-muted">
                            Now
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gw-muted">
                          Education, field, country, skills — facts HULUM can match without inventing credentials.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded border border-gw-outline-var/20 bg-gw-surface-lowest p-2 opacity-80">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-gw-outline-var/30 bg-gw-surface text-[9px] font-semibold text-gw-muted">
                        2
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-gw-on">Browse &amp; analyze an opportunity</span>
                          <span className="text-[9px] text-gw-muted">Queued</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gw-muted">
                          APPLY / MAYBE / SKIP from the decision engine — confirm on the official source.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded border border-gw-outline-var/20 bg-gw-surface-lowest p-2 opacity-80">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-gw-outline-var/30 bg-gw-surface text-[9px] font-semibold text-gw-muted">
                        3
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-gw-on">Gaps, readiness, Ask HULUM</span>
                          <span className="text-[9px] text-gw-muted">Queued</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gw-muted">
                          See what is missing and what to prepare — without silent profile writes from voice.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch justify-between gap-4 pt-1 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={beginProfile}
                      className="flex items-center justify-center gap-2 bg-gw-primary px-8 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-gw-on-primary transition-colors hover:bg-gw-on disabled:opacity-60"
                    >
                      <span>{busy ? "Opening profile…" : "Begin profile setup"}</span>
                      <span aria-hidden>→</span>
                    </button>
                    <div className="flex items-center gap-1 text-[9px] text-gw-muted">
                      <span aria-hidden>⌁</span>
                      <span>Local UUID session · not encrypted auth</span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-start justify-between gap-2 border border-gw-outline-var/20 bg-gw-surface-lowest p-4 text-[9px] text-gw-muted md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold uppercase tracking-wider text-gw-primary">System note:</span>
              <span>No fake latency / cipher claims</span>
              <span className="text-gw-outline-var">/</span>
              <span>OTP UI preview only</span>
              <span className="text-gw-outline-var">/</span>
              <span>Session = browser UUID</span>
            </div>
            <div className="flex items-center gap-1 text-gw-outline">
              <span>Gateway: local · v0.1</span>
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
            <Link href="/forgot-password" className="transition-colors hover:text-gw-primary">
              Recovery
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
