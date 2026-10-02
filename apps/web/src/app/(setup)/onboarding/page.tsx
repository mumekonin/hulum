"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  type AuthSession,
  type PatchProfileRequest,
  type ProfileDocument,
  type ProfileView,
} from "@hulum/shared";
import { StatusPanel } from "@/components/StatusPanel";
import { api, isNotFound, userFacingError } from "@/lib/api";
import { needsOnboarding } from "@/lib/post-auth";
import {
  checkDocumentFile,
  completionPercent,
  CV_LABEL,
  DOCUMENT_ACCEPT,
  fileToDocumentPayload,
  splitList,
} from "@/lib/profile-form";
import { PROFILE_FIELD_LABELS } from "@/lib/text-actions";
import { getUserId, setSessionToken, setUserId } from "@/lib/storage";

const STEPS = ["About you", "Education", "Skills and experience", "Your CV"] as const;

type Form = {
  country: string;
  city: string;
  educationLevel: string;
  fieldOfStudy: string;
  graduationYear: string;
  languages: string;
  skills: string;
  experience: string;
  interests: string;
};

const EMPTY: Form = {
  country: "",
  city: "",
  educationLevel: "",
  fieldOfStudy: "",
  graduationYear: "",
  languages: "",
  skills: "",
  experience: "",
  interests: "",
};

const inputClass =
  "min-h-11 w-full border border-line-strong bg-surface px-3 py-2 focus:border-ink";

function formFrom(view: ProfileView): Form {
  const p = view.profile;
  // A new account's placeholder row presets education and country; the user confirms them here.
  const fresh = needsOnboarding(view);
  return {
    country: fresh ? "" : (p.country ?? ""),
    city: p.city ?? "",
    educationLevel: fresh ? "" : (p.educationLevel ?? ""),
    fieldOfStudy: p.fieldOfStudy ?? "",
    graduationYear: p.graduationYear === null ? "" : String(p.graduationYear),
    languages: p.languages.join(", "),
    skills: p.skills.join(", "),
    experience: p.experience ?? "",
    interests: p.interests.join(", "),
  };
}

export default function OnboardingPage() {
  const [boot, setBoot] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null);
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvStored, setCvStored] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const userId = getUserId();
    if (userId === null) return;
    let cancelled = false;
    setBoot("loading");
    void Promise.all([
      api<AuthSession>("/api/auth/me"),
      api<ProfileView>(`/api/profile/${userId}`).catch((err: unknown) => {
        if (isNotFound(err)) return null;
        throw err;
      }),
    ])
      .then(([me, view]) => {
        if (cancelled) return;
        setAccount({ name: me.name, email: me.email });
        if (view) {
          setExists(true);
          setForm(formFrom(view));
          setMissing(view.completeness.missing);
        }
        setBoot("ready");
      })
      .catch(() => {
        if (!cancelled) setBoot("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (boot === "ready") headingRef.current?.focus();
  }, [step, boot]);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(patch: PatchProfileRequest) {
    const userId = getUserId();
    if (userId === null || account === null) throw new Error("Sign in again to continue.");
    const view = exists
      ? await api<ProfileView>(`/api/profile/${userId}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        })
      : await api<ProfileView>("/api/profile", {
          method: "POST",
          body: JSON.stringify({ userId, name: account.name, email: account.email, ...patch }),
        });
    if (!exists) {
      setUserId(view.profile.userId);
      setExists(true);
    }
    if (view.sessionToken) setSessionToken(view.sessionToken);
    setMissing(view.completeness.missing);
  }

  function patchFor(current: number): PatchProfileRequest {
    if (current === 0) return { country: form.country, city: form.city || null };
    if (current === 1) {
      return {
        educationLevel: form.educationLevel,
        fieldOfStudy: form.fieldOfStudy,
        graduationYear: form.graduationYear === "" ? null : Number(form.graduationYear),
      };
    }
    return {
      languages: splitList(form.languages),
      skills: splitList(form.skills),
      experience: form.experience || null,
      interests: splitList(form.interests),
    };
  }

  async function next(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await save(patchFor(step));
      setStep((value) => value + 1);
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setSaving(false);
    }
  }

  async function uploadCv(event: FormEvent) {
    event.preventDefault();
    const userId = getUserId();
    const file = fileRef.current?.files?.[0];
    if (userId === null || file === undefined) {
      setError("Choose your CV file first, or skip this step.");
      return;
    }
    const problem = checkDocumentFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = await fileToDocumentPayload(file);
      await api<ProfileDocument>(`/api/profile/${userId}/documents`, {
        method: "POST",
        body: JSON.stringify({ userId, label: CV_LABEL, ...payload }),
      });
      setCvStored(true);
      setStep(4);
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setSaving(false);
    }
  }

  if (boot === "loading") {
    return (
      <StatusPanel variant="loading" title="Preparing your profile">
        Loading your account.
      </StatusPanel>
    );
  }
  if (boot === "error") {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load your account"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
      >
        Check your connection and try again.
      </StatusPanel>
    );
  }

  if (step === 4) {
    const percent = completionPercent(missing);
    return (
      <section className="motion-safe:animate-[fade-in_240ms_ease-out]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Profile ready</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-4xl outline-none">
          You&apos;re set up.
        </h1>
        <p className="mt-4 leading-7 text-muted">
          HULUM will compare opportunities with what you saved. Anything you left out is treated as
          uncertain, never guessed.
        </p>
        <div className="mt-8 border-t border-line pt-6">
          <p className="text-sm">
            Profile {percent}% complete{cvStored ? " · CV stored privately" : ""}
          </p>
          <div
            className="mt-2 h-1 bg-line"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-1 bg-ink" style={{ width: `${percent}%` }} />
          </div>
          {missing.length > 0 ? (
            <p className="mt-3 text-sm text-muted">
              Still missing:{" "}
              {missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field).join(", ")}. You can add
              these any time from your profile.
            </p>
          ) : null}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/opportunities"
            className="inline-flex min-h-11 items-center bg-ink px-5 text-paper"
          >
            Find opportunities
          </Link>
          <Link
            href="/assistant"
            className="inline-flex min-h-11 items-center border border-line-strong px-5 hover:border-ink"
          >
            Ask HULUM
          </Link>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center px-2 text-muted underline underline-offset-4 hover:text-ink"
          >
            Review profile
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Step {step + 1} of {STEPS.length}
      </p>
      <ol className="mt-3 grid grid-cols-4 gap-2" aria-label="Onboarding progress">
        {STEPS.map((label, index) => (
          <li key={label} className={`h-1 ${index <= step ? "bg-ink" : "bg-line"}`}>
            <span className="sr-only">
              {label}
              {index < step ? " (done)" : index === step ? " (current)" : ""}
            </span>
          </li>
        ))}
      </ol>
      <h1 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-4xl outline-none">
        {STEPS[step]}
      </h1>

      {error ? (
        <div className="mt-6">
          <StatusPanel variant="error" title="That didn't save">
            {error}
          </StatusPanel>
        </div>
      ) : null}

      {step === 3 ? (
        <form onSubmit={(event) => void uploadCv(event)} className="mt-6 grid gap-5">
          <p className="leading-7 text-muted">
            Add your CV so HULUM can use it as supporting evidence when you analyze an opportunity.
            It never changes your saved profile by itself.
          </p>
          <label className="grid gap-2 text-sm">
            CV file (PDF or photo, up to 4 MB)
            <input
              id="onboarding-cv"
              ref={fileRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              onChange={(event) => setCvName(event.target.files?.[0]?.name ?? null)}
              className="min-h-11 border border-line-strong bg-surface px-3 py-2 file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-paper"
            />
          </label>
          <p className="border-l-2 border-line-strong pl-3 text-sm text-muted">
            Your CV is private. Only you can open it, and it never appears on opportunity pages or
            in links.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || cvName === null}
              className="min-h-11 bg-ink px-5 text-paper disabled:opacity-60"
            >
              {saving ? "Uploading…" : "Upload and finish"}
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="min-h-11 px-2 text-muted underline underline-offset-4 hover:text-ink"
            >
              Skip for now
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={(event) => void next(event)} className="mt-6 grid gap-5">
          {step === 0 ? (
            <>
              <dl className="grid gap-3 border-y border-line py-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-0.5">{account?.name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="mt-0.5 break-all">{account?.email}</dd>
                </div>
              </dl>
              <label htmlFor="onboarding-country" className="grid gap-1 text-sm">
                Country
                <input
                  id="onboarding-country"
                  required
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                  autoComplete="country-name"
                  placeholder="Ethiopia"
                  className={inputClass}
                />
              </label>
              <label htmlFor="onboarding-city" className="grid gap-1 text-sm">
                City <span className="text-muted">(optional)</span>
                <input
                  id="onboarding-city"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  autoComplete="address-level2"
                  placeholder="Addis Ababa"
                  className={inputClass}
                />
              </label>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <label htmlFor="onboarding-education" className="grid gap-1 text-sm">
                Education level
                <select
                  id="onboarding-education"
                  required
                  value={form.educationLevel}
                  onChange={(event) => update("educationLevel", event.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Choose your current level
                  </option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {EDUCATION_LABELS[level]}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="onboarding-field" className="grid gap-1 text-sm">
                Field of study
                <input
                  id="onboarding-field"
                  required
                  value={form.fieldOfStudy}
                  onChange={(event) => update("fieldOfStudy", event.target.value)}
                  placeholder="Computer Science"
                  className={inputClass}
                />
              </label>
              <label htmlFor="onboarding-graduation" className="grid gap-1 text-sm">
                Graduation year{" "}
                <span className="text-muted">(expected or completed, optional)</span>
                <input
                  id="onboarding-graduation"
                  type="number"
                  inputMode="numeric"
                  min={1950}
                  max={2100}
                  value={form.graduationYear}
                  onChange={(event) => update("graduationYear", event.target.value)}
                  className={inputClass}
                />
              </label>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="text-sm text-muted">All optional. Separate items with commas.</p>
              <label htmlFor="onboarding-languages" className="grid gap-1 text-sm">
                Languages you speak
                <input
                  id="onboarding-languages"
                  value={form.languages}
                  onChange={(event) => update("languages", event.target.value)}
                  placeholder="English, Amharic"
                  className={inputClass}
                />
              </label>
              <label htmlFor="onboarding-skills" className="grid gap-1 text-sm">
                Skills
                <input
                  id="onboarding-skills"
                  value={form.skills}
                  onChange={(event) => update("skills", event.target.value)}
                  placeholder="Python, data analysis"
                  className={inputClass}
                />
              </label>
              <label htmlFor="onboarding-experience" className="grid gap-1 text-sm">
                Experience
                <textarea
                  id="onboarding-experience"
                  value={form.experience}
                  onChange={(event) => update("experience", event.target.value)}
                  rows={3}
                  placeholder="Internships, jobs, volunteering, research"
                  className={`${inputClass} min-h-24`}
                />
              </label>
              <label htmlFor="onboarding-interests" className="grid gap-1 text-sm">
                Interests
                <input
                  id="onboarding-interests"
                  value={form.interests}
                  onChange={(event) => update("interests", event.target.value)}
                  placeholder="AI, public health, scholarships abroad"
                  className={inputClass}
                />
              </label>
            </>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 bg-ink px-5 text-paper disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue"}
            </button>
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="min-h-11 px-2 text-muted underline underline-offset-4 hover:text-ink"
              >
                Back
              </button>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
