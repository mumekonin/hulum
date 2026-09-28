"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  type LanguageCode,
  type PatchProfileRequest,
  type ProfileDocument,
  type ProfileExtractResult,
  type ProfileView,
} from "@hulum/shared";
import { api, apiBlob, isNotFound, userFacingError } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { initialsOf } from "@/lib/account";
import { needsOnboarding } from "@/lib/post-auth";
import {
  checkDocumentFile,
  completionPercent,
  CV_LABEL,
  DOCUMENT_ACCEPT,
  educationLabel,
  fileToDocumentPayload,
  findCv,
  isCvDocument,
  profileHeadline,
  splitList,
} from "@/lib/profile-form";
import { PROFILE_FIELD_LABELS } from "@/lib/text-actions";
import { getLanguage, getUserId, setLanguage, setSessionToken } from "@/lib/storage";
import { StatusPanel } from "@/components/StatusPanel";

type Form = {
  educationLevel: string;
  fieldOfStudy: string;
  graduationYear: string;
  country: string;
  city: string;
  languages: string;
  skills: string;
  experience: string;
  interests: string;
  preferredLanguage: LanguageCode;
};

function formFrom(view: ProfileView): Form {
  const p = view.profile;
  return {
    educationLevel: p.educationLevel ?? "",
    fieldOfStudy: p.fieldOfStudy ?? "",
    graduationYear: p.graduationYear === null ? "" : String(p.graduationYear),
    country: p.country ?? "",
    city: p.city ?? "",
    languages: p.languages.join(", "),
    skills: p.skills.join(", "),
    experience: p.experience ?? "",
    interests: p.interests.join(", "),
    preferredLanguage: getLanguage(),
  };
}

function patchFrom(form: Form): PatchProfileRequest {
  return {
    educationLevel: form.educationLevel || null,
    fieldOfStudy: form.fieldOfStudy || null,
    graduationYear: form.graduationYear === "" ? null : Number(form.graduationYear),
    country: form.country || null,
    city: form.city || null,
    languages: splitList(form.languages),
    skills: splitList(form.skills),
    experience: form.experience || null,
    interests: splitList(form.interests),
  };
}

const inputClass =
  "min-h-11 w-full border border-line-strong bg-surface px-3 py-2 focus:border-ink";
const secondaryButton =
  "inline-flex min-h-10 items-center border border-line-strong px-3 text-sm transition-colors hover:border-ink disabled:opacity-60";

function extensionFor(mimeType: string): string {
  return mimeType === "application/pdf" ? "pdf" : mimeType.replace("image/", "");
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const shown = value?.trim();
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={shown ? "leading-7" : "text-muted"}>{shown || "Not added"}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const [boot, setBoot] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState<ProfileView | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [extractText, setExtractText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProfileExtractResult | null>(null);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [documentLabel, setDocumentLabel] = useState("");
  const [documentBusy, setDocumentBusy] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const documentFileRef = useRef<HTMLInputElement>(null);
  const cvFileRef = useRef<HTMLInputElement>(null);
  const editHeadingRef = useRef<HTMLHeadingElement>(null);

  const cv = findCv(documents);
  const otherDocuments = documents.filter((doc) => !isCvDocument(doc));

  useEffect(() => {
    const userId = getUserId();
    if (userId === null) return;
    let cancelled = false;
    setBoot("loading");
    setLoadError(null);
    void api<ProfileView>(`/api/profile/${userId}`)
      .then((loaded) => {
        if (cancelled) return;
        if (loaded.sessionToken) setSessionToken(loaded.sessionToken);
        setView(loaded);
        setBoot("ready");
        void api<ProfileDocument[]>(`/api/profile/${userId}/documents`)
          .then((items) => {
            if (!cancelled) setDocuments(items);
          })
          .catch(() => undefined);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isNotFound(err)) {
          setBoot("missing");
          return;
        }
        setLoadError(userFacingError(err));
        setBoot("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const userId = getUserId();
    const images = documents.filter(
      (doc) => !isCvDocument(doc) && doc.mimeType.startsWith("image/"),
    );
    if (userId === null || images.length === 0) return;
    let cancelled = false;
    const urls: string[] = [];
    void Promise.all(
      images.map(async (doc) => {
        const url = URL.createObjectURL(
          await apiBlob(`/api/profile/${userId}/documents/${doc.id}`),
        );
        urls.push(url);
        return [doc.id, url] as const;
      }),
    )
      .then((entries) => {
        if (!cancelled) setPreviews(Object.fromEntries(entries));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documents]);

  useEffect(() => {
    if (editing) editHeadingRef.current?.focus();
  }, [editing]);

  function startEditing() {
    if (view === null) return;
    setForm(formFrom(view));
    setSaveError(null);
    setSaveState("idle");
    setEditing(true);
  }

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => (current === null ? current : { ...current, [key]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const userId = getUserId();
    if (form === null || userId === null) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const saved = await api<ProfileView>(`/api/profile/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(patchFrom(form)),
      });
      if (saved.sessionToken) setSessionToken(saved.sessionToken);
      setLanguage(form.preferredLanguage);
      setView(saved);
      setSaveState("saved");
      setEditing(false);
    } catch (err) {
      setSaveState("idle");
      setSaveError(userFacingError(err));
    }
  }

  async function runExtract() {
    setExtracting(true);
    setSaveError(null);
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
      setSaveError(userFacingError(err));
    } finally {
      setExtracting(false);
    }
  }

  function applyProposal() {
    if (!proposal) return;
    const p = proposal.proposed;
    const level = EDUCATION_LEVELS.find((item) => item === p.educationLevel);
    setForm((current) =>
      current === null
        ? current
        : {
            ...current,
            educationLevel: level ?? current.educationLevel,
            fieldOfStudy: p.fieldOfStudy ?? current.fieldOfStudy,
            graduationYear:
              p.graduationYear === null ? current.graduationYear : String(p.graduationYear),
            country: p.country ?? current.country,
            city: p.city ?? current.city,
            languages: p.languages.length > 0 ? p.languages.join(", ") : current.languages,
            skills: p.skills.length > 0 ? p.skills.join(", ") : current.skills,
            experience: p.experience ?? current.experience,
            interests: p.interests.length > 0 ? p.interests.join(", ") : current.interests,
          },
    );
    setExtractNotice(
      "The proposed details were copied into the form below. Review them, then save — nothing is stored yet.",
    );
    setProposal(null);
  }

  async function upload(file: File, label: string): Promise<ProfileDocument> {
    const userId = getUserId();
    if (userId === null) throw new Error("Sign in again to upload.");
    const problem = checkDocumentFile(file);
    if (problem) throw new Error(problem);
    const payload = await fileToDocumentPayload(file);
    return api<ProfileDocument>(`/api/profile/${userId}/documents`, {
      method: "POST",
      body: JSON.stringify({ userId, label, ...payload }),
    });
  }

  async function remove(documentId: string): Promise<void> {
    const userId = getUserId();
    if (userId === null) return;
    await api<{ deleted: boolean }>(`/api/profile/${userId}/documents/${documentId}`, {
      method: "DELETE",
    });
    setDocuments((current) => current.filter((item) => item.id !== documentId));
  }

  async function withDocument(key: string, work: () => Promise<void>) {
    setDocumentBusy(key);
    setDocumentError(null);
    try {
      await work();
    } catch (err) {
      setDocumentError(userFacingError(err));
    } finally {
      setDocumentBusy(null);
    }
  }

  function uploadCv(file: File | undefined) {
    if (file === undefined) return;
    const previous = cv;
    void withDocument("cv", async () => {
      const created = await upload(file, CV_LABEL);
      setDocuments((current) => [created, ...current]);
      if (previous) {
        try {
          await remove(previous.id);
        } catch {
          throw new Error(
            "Your new CV is stored, but the old one couldn't be removed. Remove it from Other documents.",
          );
        }
      }
    }).finally(() => {
      if (cvFileRef.current) cvFileRef.current.value = "";
    });
  }

  async function openCv(download: boolean) {
    const userId = getUserId();
    if (userId === null || cv === undefined) return;
    const target = download ? null : window.open("", "_blank");
    await withDocument(download ? "cv-download" : "cv-view", async () => {
      let blob: Blob;
      try {
        blob = await apiBlob(`/api/profile/${userId}/documents/${cv.id}`);
      } catch (err) {
        target?.close();
        throw err;
      }
      const url = URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `CV.${extensionFor(cv.mimeType)}`;
        link.click();
      } else if (target) {
        target.location.href = url;
      } else {
        window.location.assign(url);
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });
  }

  function addDocument(event: FormEvent) {
    event.preventDefault();
    const file = documentFileRef.current?.files?.[0];
    const label = documentLabel.trim();
    if (label === "") {
      setDocumentError("Name the document first, for example Transcript or Passport.");
      return;
    }
    if (file === undefined) {
      setDocumentError("Choose a photo or PDF first.");
      return;
    }
    void withDocument("add", async () => {
      const created = await upload(file, label);
      setDocuments((current) => [created, ...current]);
      setDocumentLabel("");
      if (documentFileRef.current) documentFileRef.current.value = "";
    });
  }

  if (boot === "loading") {
    return (
      <StatusPanel variant="loading" title="Loading your profile">
        Reading what you saved.
      </StatusPanel>
    );
  }
  if (boot === "error") {
    return (
      <StatusPanel
        variant="error"
        title="We couldn't load your profile"
        primary={{ label: "Try again", onClick: () => setReloadKey((value) => value + 1) }}
      >
        {loadError ?? "Try again in a moment."}
      </StatusPanel>
    );
  }
  if (boot === "missing" || view === null) {
    return (
      <StatusPanel
        variant="empty"
        title="Set up your profile"
        primary={{ label: "Start setup", href: "/onboarding" }}
      >
        HULUM needs a few facts about you to say APPLY, MAYBE, or SKIP. It takes about two minutes.
      </StatusPanel>
    );
  }

  const profile = view.profile;
  const percent = completionPercent(view.completeness.missing);
  const headline = profileHeadline(profile);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const language = LANGUAGE_OPTIONS.find((option) => option.code === getLanguage())?.label;

  return (
    <section className="max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center border border-line-strong font-display text-xl"
          >
            {initialsOf(view.name)}
          </span>
          <div>
            <h1 className="font-display text-4xl">Your profile</h1>
            <p className="mt-1 text-lg">{view.name}</p>
            <p className="text-muted">
              {headline ?? "Add your field of study and education level"}
            </p>
            <p className="mt-1 break-all text-sm text-muted">{view.email}</p>
          </div>
        </div>
        {!editing ? (
          <button type="button" onClick={startEditing} className="min-h-11 bg-ink px-5 text-paper">
            Edit profile
          </button>
        ) : null}
      </header>

      <p className="sr-only" role="status">
        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Profile saved" : ""}
      </p>
      {saveState === "saved" && !editing ? <p className="mt-4 text-sm text-apply">Saved.</p> : null}

      {needsOnboarding(view) && !editing ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-l-2 border-ink bg-surface-muted px-4 py-3 text-sm">
          <p>Your profile isn&apos;t set up yet, so HULUM can&apos;t judge your fit well.</p>
          <Link href="/onboarding" className="underline underline-offset-4">
            Finish setup
          </Link>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm">Profile {percent}% complete</p>
          {view.completeness.missing.length > 0 && !editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="text-sm text-muted underline underline-offset-4 hover:text-ink"
            >
              Add missing details
            </button>
          ) : null}
        </div>
        <div
          className="mt-2 h-1 bg-line"
          role="progressbar"
          aria-label="Profile completion"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-1 bg-ink" style={{ width: `${percent}%` }} />
        </div>
        {view.completeness.missing.length > 0 ? (
          <p className="mt-2 text-sm text-muted">
            Missing:{" "}
            {view.completeness.missing
              .map((field) => PROFILE_FIELD_LABELS[field] ?? field)
              .join(", ")}
            . HULUM treats missing facts as uncertain, never guessed.
          </p>
        ) : null}
      </div>

      {editing && form ? (
        <form
          onSubmit={(event) => void save(event)}
          className="mt-10 grid gap-5"
          aria-describedby={saveError ? "profile-save-error" : undefined}
        >
          <h2 ref={editHeadingRef} tabIndex={-1} className="font-display text-2xl outline-none">
            Edit profile
          </h2>
          {saveError ? (
            <div id="profile-save-error">
              <StatusPanel variant="error" title="We couldn't save your profile">
                {saveError}
              </StatusPanel>
            </div>
          ) : null}

          <details className="border border-line bg-surface p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Fill from a description of yourself
            </summary>
            <div className="mt-4 grid gap-3">
              <p className="text-sm text-muted">
                Paste a short description. HULUM proposes details; you review them before anything
                is saved.
              </p>
              <textarea
                aria-label="Description of yourself"
                value={extractText}
                onChange={(event) => setExtractText(event.target.value)}
                rows={4}
                className={inputClass}
                placeholder="I am a Computer Science student in Addis Ababa. I speak English and Amharic…"
              />
              <button
                type="button"
                onClick={() => void runExtract()}
                disabled={extracting || extractText.trim().length < 8}
                className={`${secondaryButton} w-fit`}
              >
                {extracting ? "Reading…" : "Propose details"}
              </button>
              {extractNotice ? <p className="text-sm text-muted">{extractNotice}</p> : null}
              {proposal && proposal.filledFields.length > 0 ? (
                <div className="grid gap-3 border-t border-line pt-3 text-sm">
                  <p className="font-medium">Proposed — not saved</p>
                  <dl className="grid gap-1">
                    {proposal.filledFields.map((field) => {
                      const value = proposal.proposed[field];
                      return (
                        <div key={field} className="grid grid-cols-[9rem_1fr] gap-2">
                          <dt className="text-muted">{PROFILE_FIELD_LABELS[field] ?? field}</dt>
                          <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
                        </div>
                      );
                    })}
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applyProposal}
                      className="min-h-10 bg-ink px-4 text-sm text-paper"
                    >
                      Use these in the form
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposal(null)}
                      className={secondaryButton}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </details>

          <fieldset className="grid gap-4 border-t border-line pt-5">
            <legend className="pr-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Education
            </legend>
            <label htmlFor="profile-education" className="grid gap-1 text-sm">
              Education level
              <select
                id="profile-education"
                value={form.educationLevel}
                onChange={(event) => update("educationLevel", event.target.value)}
                className={inputClass}
              >
                <option value="">Not added</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {EDUCATION_LABELS[level]}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="profile-field" className="grid gap-1 text-sm">
              Field of study
              <input
                id="profile-field"
                value={form.fieldOfStudy}
                onChange={(event) => update("fieldOfStudy", event.target.value)}
                className={inputClass}
              />
            </label>
            <label htmlFor="profile-graduation-year" className="grid gap-1 text-sm">
              Graduation year
              <input
                id="profile-graduation-year"
                type="number"
                inputMode="numeric"
                min={1950}
                max={2100}
                value={form.graduationYear}
                onChange={(event) => update("graduationYear", event.target.value)}
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <legend className="pr-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Location
            </legend>
            <label htmlFor="profile-country" className="grid gap-1 text-sm">
              Country
              <input
                id="profile-country"
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
                autoComplete="country-name"
                className={inputClass}
              />
            </label>
            <label htmlFor="profile-city" className="grid gap-1 text-sm">
              City
              <input
                id="profile-city"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                autoComplete="address-level2"
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5">
            <legend className="pr-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Skills and experience
            </legend>
            <p className="text-sm text-muted">Separate items with commas.</p>
            <label htmlFor="profile-languages" className="grid gap-1 text-sm">
              Languages you speak
              <input
                id="profile-languages"
                value={form.languages}
                onChange={(event) => update("languages", event.target.value)}
                className={inputClass}
              />
            </label>
            <label htmlFor="profile-skills" className="grid gap-1 text-sm">
              Skills
              <input
                id="profile-skills"
                value={form.skills}
                onChange={(event) => update("skills", event.target.value)}
                className={inputClass}
              />
            </label>
            <label htmlFor="profile-experience" className="grid gap-1 text-sm">
              Experience
              <textarea
                id="profile-experience"
                value={form.experience}
                onChange={(event) => update("experience", event.target.value)}
                rows={3}
                className={`${inputClass} min-h-24`}
              />
            </label>
            <label htmlFor="profile-interests" className="grid gap-1 text-sm">
              Interests
              <input
                id="profile-interests"
                value={form.interests}
                onChange={(event) => update("interests", event.target.value)}
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-5">
            <legend className="pr-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Preferences
            </legend>
            <label htmlFor="profile-hulum-language" className="grid gap-1 text-sm">
              HULUM reply language
              <select
                id="profile-hulum-language"
                value={form.preferredLanguage}
                onChange={(event) =>
                  update("preferredLanguage", event.target.value as LanguageCode)
                }
                className={inputClass}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-muted">Stored in this browser.</span>
            </label>
          </fieldset>

          <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-line bg-paper py-4">
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="min-h-11 bg-ink px-5 text-paper disabled:opacity-60"
            >
              {saveState === "saving" ? "Saving…" : "Save profile"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saveState === "saving"}
              className="min-h-11 px-2 text-muted underline underline-offset-4 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-10 divide-y divide-line border-y border-line">
          <Row label="Education level" value={educationLabel(profile.educationLevel)} />
          <Row label="Field of study" value={profile.fieldOfStudy} />
          <Row
            label="Graduation year"
            value={profile.graduationYear === null ? null : String(profile.graduationYear)}
          />
          <Row label="Location" value={location} />
          <Row label="Languages" value={profile.languages.join(", ")} />
          <Row label="Skills" value={profile.skills.join(", ")} />
          <Row label="Experience" value={profile.experience} />
          <Row label="Interests" value={profile.interests.join(", ")} />
          <Row label="Reply language" value={language} />
        </dl>
      )}
      {!editing ? (
        <p className="mt-3 text-sm text-muted">
          Name and email come from your account and can&apos;t be changed here.
        </p>
      ) : null}

      <section aria-labelledby="cv-heading" className="mt-14">
        <h2 id="cv-heading" className="font-display text-2xl">
          CV
        </h2>
        <p className="mt-2 text-sm text-muted">
          Private to you. HULUM reads it as supporting evidence when you analyze an opportunity; it
          never changes your saved profile by itself and never appears on opportunity pages or in
          links.
        </p>
        {documentError ? (
          <div className="mt-4">
            <StatusPanel variant="error" title="That didn't work">
              {documentError}
            </StatusPanel>
          </div>
        ) : null}
        <input
          ref={cvFileRef}
          type="file"
          accept={DOCUMENT_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => uploadCv(event.target.files?.[0])}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-4">
          {cv ? (
            <div>
              <p className="font-medium">{cv.label}</p>
              <p className="text-sm text-muted">
                {extensionFor(cv.mimeType).toUpperCase()} · uploaded{" "}
                {new Date(cv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-muted">No CV uploaded yet.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {cv ? (
              <>
                <button
                  type="button"
                  disabled={documentBusy !== null}
                  onClick={() => void openCv(false)}
                  className={secondaryButton}
                >
                  {documentBusy === "cv-view" ? "Opening…" : "View"}
                </button>
                <button
                  type="button"
                  disabled={documentBusy !== null}
                  onClick={() => void openCv(true)}
                  className={secondaryButton}
                >
                  Download
                </button>
              </>
            ) : null}
            <button
              type="button"
              disabled={documentBusy !== null}
              onClick={() => cvFileRef.current?.click()}
              className={
                cv
                  ? secondaryButton
                  : "inline-flex min-h-10 items-center bg-ink px-4 text-sm text-paper disabled:opacity-60"
              }
            >
              {documentBusy === "cv" ? "Uploading…" : cv ? "Replace" : "Upload CV"}
            </button>
            {cv ? (
              <button
                type="button"
                disabled={documentBusy !== null}
                onClick={() => void withDocument("cv-remove", () => remove(cv.id))}
                className="min-h-10 px-2 text-sm text-muted underline underline-offset-4 hover:text-ink"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="documents-heading" className="mt-14">
        <h2 id="documents-heading" className="font-display text-2xl">
          Other documents
        </h2>
        <p className="mt-2 text-sm text-muted">
          Transcripts, certificates, passport. The name you give a document is what HULUM compares
          with required documents. Readable text supports evidence during Analyze; it never marks a
          requirement met on its own.
        </p>
        {otherDocuments.length > 0 ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {otherDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center gap-4 py-3">
                {previews[doc.id] ? (
                  <img src={previews[doc.id]} alt="" className="h-14 w-16 object-cover" />
                ) : (
                  <span className="flex h-14 w-16 items-center justify-center bg-surface-muted text-xs text-muted">
                    {extensionFor(doc.mimeType).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{doc.label}</span>
                <button
                  type="button"
                  disabled={documentBusy !== null}
                  onClick={() => void withDocument(`remove-${doc.id}`, () => remove(doc.id))}
                  className="min-h-10 px-2 text-sm text-muted underline underline-offset-4 hover:text-ink"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No other documents yet.</p>
        )}
        <form
          onSubmit={addDocument}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="grid gap-1 text-sm">
            Document name
            <input
              value={documentLabel}
              onChange={(event) => setDocumentLabel(event.target.value)}
              placeholder="Transcript"
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Photo or PDF, up to 4 MB
            <input
              ref={documentFileRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              className="min-h-11 border border-line-strong bg-surface px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:text-paper"
            />
          </label>
          <button
            type="submit"
            disabled={documentBusy !== null}
            className={`${secondaryButton} min-h-11`}
          >
            {documentBusy === "add" ? "Uploading…" : "Add document"}
          </button>
        </form>
      </section>
    </section>
  );
}
