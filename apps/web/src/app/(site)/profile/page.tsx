"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EDUCATION_LABELS, EDUCATION_LEVELS, type AuthSession, type EducationLevel, type LanguageCode, type ProfileExtractResult, type ProfileView } from "@hulum/shared";
import { api, isNotFound, userFacingError } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { getLanguage, getUserId, setLanguage, setSessionToken, setUserId } from "@/lib/storage";
import { Notice } from "@/components/Notice";
import { StatusPanel } from "@/components/StatusPanel";

const emptyForm = {
  name: "",
  email: "",
  educationLevel: "bachelor_in_progress" as EducationLevel,
  fieldOfStudy: "",
  graduationYear: 2027,
  country: "Ethiopia",
  city: "",
  languages: "English, Amharic",
  skills: "",
  experience: "",
  yearsExperience: 0,
  interests: "",
  documentsHeld: "",
  preferredLanguage: "en" as LanguageCode,
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [boot, setBoot] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [extractText, setExtractText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProfileExtractResult | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
      setHasProfile(false);
      setBoot("ready");
      return;
    }
    setBoot("loading");
    setLoadError(null);
    void api<ProfileView>(`/api/profile/${userId}`)
      .then((view) => {
        const profile = view.profile;
        const storedLevel = EDUCATION_LEVELS.find((level) => level === profile.educationLevel);
        setForm({
          name: view.name,
          email: view.email,
          educationLevel: storedLevel ?? "bachelor_in_progress",
          fieldOfStudy: profile.fieldOfStudy ?? "",
          graduationYear: profile.graduationYear ?? 2027,
          country: profile.country ?? "",
          city: profile.city ?? "",
          languages: profile.languages.join(", "),
          skills: profile.skills.join(", "),
          experience: profile.experience ?? "",
          yearsExperience: 0,
          interests: profile.interests.join(", "),
          documentsHeld: "",
          preferredLanguage: getLanguage(),
        });
        if (view.sessionToken) setSessionToken(view.sessionToken);
        setHasProfile(true);
        setBoot("ready");
      })
      .catch((err: unknown) => {
        if (isNotFound(err)) {
          void api<AuthSession>("/api/auth/me")
            .then((me) => {
              setForm((current) => ({ ...current, name: me.name, email: me.email }));
            })
            .catch(() => undefined)
            .finally(() => {
              setHasProfile(false);
              setBoot("ready");
            });
          return;
        }
        setLoadError(userFacingError(err));
        setBoot("error");
      });
  }, [reloadKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const storedId = getUserId();
      const userId = storedId !== null && /^[0-9a-f-]{36}$/i.test(storedId) ? storedId : null;
      const usePatch = hasProfile && userId !== null;
      const view = await api<ProfileView>(usePatch ? `/api/profile/${userId}` : "/api/profile", {
        method: usePatch ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(usePatch || userId === null ? {} : { userId }),
          name: form.name,
          email: form.email,
          educationLevel: form.educationLevel,
          fieldOfStudy: form.fieldOfStudy,
          graduationYear: Number(form.graduationYear),
          country: form.country,
          city: form.city || null,
          languages: splitList(form.languages),
          skills: splitList(form.skills),
          experience: form.experience,
          interests: splitList(form.interests),
        }),
      });
      setUserId(view.profile.userId);
      setSessionToken(view.sessionToken);
      setHasProfile(true);
      setLanguage(form.preferredLanguage);
      setSaved(true);
      router.push("/opportunities");
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setSaving(false);
    }
  }

  async function runExtract() {
    setExtracting(true);
    setError(null);
    setExtractNotice(null);
    setProposal(null);
    try {
      const result = await api<ProfileExtractResult>("/api/ai/profile-extract", {
        method: "POST",
        body: JSON.stringify({ text: extractText }),
      });
      setProposal(result);
      setExtractNotice(result.notice);
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setExtracting(false);
    }
  }

  function applyProposalToForm() {
    if (!proposal) return;
    const p = proposal.proposed;
    const level = EDUCATION_LEVELS.find((item) => item === p.educationLevel);
    setForm((current) => ({
      ...current,
      educationLevel: level ?? current.educationLevel,
      fieldOfStudy: p.fieldOfStudy ?? current.fieldOfStudy,
      graduationYear: p.graduationYear ?? current.graduationYear,
      country: p.country ?? current.country,
      city: p.city ?? current.city,
      languages: p.languages.length > 0 ? p.languages.join(", ") : current.languages,
      skills: p.skills.length > 0 ? p.skills.join(", ") : current.skills,
      experience: p.experience ?? current.experience,
      interests: p.interests.length > 0 ? p.interests.join(", ") : current.interests,
    }));
    setExtractNotice(
      "Proposed fields were copied into the form. Review them, then save — nothing was stored yet.",
    );
    setProposal(null);
  }

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl">Your profile</h1>
      <p className="mt-3 text-muted">HULUM only compares what you declare here with structured opportunity requirements.</p>
      <div className="mt-6">
        <Notice>
          You are signed in. Save your own facts for APPLY / MAYBE / SKIP. HULUM does not invent a demo
          profile.
        </Notice>
      </div>
      {boot === "loading" ? (
        <StatusPanel variant="loading" title="Loading your profile">
          HULUM is checking whether you already saved facts for this browser.
        </StatusPanel>
      ) : null}
      {boot === "error" ? (
        <StatusPanel
          variant="error"
          title="We couldn't load your profile"
          primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
          secondary={{ label: "Start a new profile", onClick: () => setBoot("ready") }}
        >
          {loadError ?? "Try again, or fill in a new profile below."}
        </StatusPanel>
      ) : null}
      {boot === "ready" ? (
        <>
          {error ? (
            <StatusPanel variant="error" title="We couldn't save your profile">
              {error}
            </StatusPanel>
          ) : null}
          {saved ? <p className="mt-4 text-apply">Profile saved.</p> : null}

          <div className="mt-8 grid gap-3 border-t border-line pt-8">
            <h2 className="font-display text-2xl">Extract from a self-description</h2>
            <p className="text-sm text-muted">
              Paste text about yourself. HULUM proposes fields only — you must confirm into the form
              and save before they are stored.
            </p>
            <label className="grid gap-1 text-sm">
              Self-description
              <textarea
                value={extractText}
                onChange={(e) => setExtractText(e.target.value)}
                rows={4}
                className="border border-line bg-white px-3 py-2"
                placeholder="I am a Computer Science student in Addis Ababa, Ethiopia. I speak English and Amharic…"
              />
            </label>
            <button
              type="button"
              onClick={() => void runExtract()}
              disabled={extracting || extractText.trim().length < 8}
              className="min-h-11 w-fit border border-ink px-4 py-2 text-sm disabled:opacity-60"
            >
              {extracting ? "Extracting…" : "Propose profile fields"}
            </button>
            {extractNotice ? <p className="text-sm text-muted">{extractNotice}</p> : null}
            {proposal && proposal.filledFields.length > 0 ? (
              <div className="grid gap-2 text-sm">
                <p className="font-medium">Proposed (not saved):</p>
                <ul className="list-disc pl-5">
                  {proposal.filledFields.map((field) => {
                    const value = proposal.proposed[field];
                    const shown = Array.isArray(value) ? value.join(", ") : String(value);
                    return (
                      <li key={field}>
                        {field}: {shown}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={applyProposalToForm}
                    className="min-h-11 border border-ink bg-ink px-4 py-2 text-sm text-white"
                  >
                    Confirm into form
                  </button>
                  <button
                    type="button"
                    onClick={() => setProposal(null)}
                    className="min-h-11 border border-line px-4 py-2 text-sm"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4" aria-describedby={error ? "profile-save-error" : undefined}>
            {error ? <p id="profile-save-error" className="sr-only">{error}</p> : null}
            <label className="grid gap-1 text-sm">
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Email
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Education
              <select
                value={form.educationLevel}
                onChange={(e) => setForm({ ...form, educationLevel: e.target.value as EducationLevel })}
                className="min-h-11 border border-line bg-white px-3 py-2"
              >
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {EDUCATION_LABELS[level]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Field of study
              <input required value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Graduation year
                <input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })} className="min-h-11 border border-line bg-white px-3 py-2" />
              </label>
            <label className="grid gap-1 text-sm">
              Years of experience
              <input type="number" min={0} step={0.5} value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })} className="min-h-11 border border-line bg-white px-3 py-2" />
              <span className="text-muted">Shown here only. Postgres v1 stores the experience text, not this number.</span>
            </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Country
                <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                City
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              Languages (comma separated)
              <input required value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              HULUM language
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as LanguageCode })}
                className="min-h-11 border border-line bg-white px-3 py-2"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Skills
              <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Experience
              <textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="min-h-24 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Interests
              <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="min-h-11 border border-line bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              Documents you already have
              <input value={form.documentsHeld} onChange={(e) => setForm({ ...form, documentsHeld: e.target.value })} placeholder="CV, Transcript" className="min-h-11 border border-line bg-white px-3 py-2" />
              <span className="text-muted">Not stored in Postgres v1. Readiness still comes from the analysis.</span>
            </label>
            <button disabled={saving} className="min-h-11 bg-ink px-5 py-3 text-paper disabled:opacity-60">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </>
      ) : null}
    </section>
  );
}
