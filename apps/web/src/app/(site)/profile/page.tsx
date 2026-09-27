"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  type AuthSession,
  type EducationLevel,
  type LanguageCode,
  type ProfileDocument,
  type ProfileExtractResult,
  type ProfileView,
} from "@hulum/shared";
import { api, apiBlob, isNotFound, userFacingError } from "@/lib/api";
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
  preferredLanguage: "en" as LanguageCode,
};

const DOCUMENT_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

function mimeFromFile(file: File): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" | null {
  if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp" || file.type === "application/pdf") {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".pdf")) return "application/pdf";
  return null;
}

function fileToDocumentPayload(file: File): Promise<{
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  fileBase64: string;
}> {
  return new Promise((resolve, reject) => {
    const mimeType = mimeFromFile(file);
    if (mimeType === null) {
      reject(new Error("Use a JPEG, PNG, WebP photo, or a PDF."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      const fileBase64 = comma >= 0 ? result.slice(comma + 1) : "";
      if (fileBase64.trim() === "") {
        reject(new Error("Could not read that file."));
        return;
      }
      resolve({ mimeType, fileBase64 });
    };
    reader.readAsDataURL(file);
  });
}

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
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [documentLabel, setDocumentLabel] = useState("");
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          preferredLanguage: getLanguage(),
        });
        if (view.sessionToken) setSessionToken(view.sessionToken);
        setHasProfile(true);
        setBoot("ready");
        void api<ProfileDocument[]>(`/api/profile/${userId}/documents`)
          .then(setDocuments)
          .catch(() => setDocuments([]));
      })
      .catch((err: unknown) => {
        if (isNotFound(err)) {
          void api<ProfileDocument[]>(`/api/profile/${userId}/documents`)
            .then(setDocuments)
            .catch(() => setDocuments([]));
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

  useEffect(() => {
    const userId = getUserId();
    if (!userId || documents.length === 0) {
      setPreviews((current) => {
        Object.values(current).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
      return;
    }
    let cancelled = false;
    const urls: string[] = [];
    void Promise.all(
      documents
        .filter((doc) => doc.mimeType.startsWith("image/"))
        .map(async (doc) => {
          const blob = await apiBlob(`/api/profile/${userId}/documents/${doc.id}`);
          const url = URL.createObjectURL(blob);
          urls.push(url);
          return [doc.id, url] as const;
        }),
    )
      .then((entries) => {
        if (cancelled) {
          urls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }
        setPreviews((current) => {
          Object.values(current).forEach((url) => URL.revokeObjectURL(url));
          return Object.fromEntries(entries);
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [documents]);

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

  async function uploadDocument(event: FormEvent) {
    event.preventDefault();
    const userId = getUserId();
    if (userId === null || !/^[0-9a-f-]{36}$/i.test(userId)) {
      setDocumentError("Sign in first, then upload a photo of a document you already have.");
      return;
    }
    const file = fileInputRef.current?.files?.[0];
    const label = documentLabel.trim();
    if (label === "") {
      setDocumentError("Name the document first — for example CV or Transcript.");
      return;
    }
    if (file === undefined) {
      setDocumentError("Choose a photo or PDF first.");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES || mimeFromFile(file) === null || !DOCUMENT_MIMES.has(mimeFromFile(file) ?? "")) {
      setDocumentError("Use a JPEG, PNG, WebP, or PDF under 4 MB.");
      return;
    }
    setDocumentUploading(true);
    setDocumentError(null);
    try {
      const payload = await fileToDocumentPayload(file);
      const created = await api<ProfileDocument>(`/api/profile/${userId}/documents`, {
        method: "POST",
        body: JSON.stringify({ userId, label, ...payload }),
      });
      setDocuments((current) => [created, ...current]);
      setDocumentLabel("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setDocumentError(userFacingError(err));
    } finally {
      setDocumentUploading(false);
    }
  }

  async function removeDocument(documentId: string) {
    const userId = getUserId();
    if (userId === null) {
      return;
    }
    setDocumentError(null);
    try {
      await api<{ deleted: boolean }>(`/api/profile/${userId}/documents/${documentId}`, {
        method: "DELETE",
      });
      setDocuments((current) => current.filter((item) => item.id !== documentId));
    } catch (err) {
      setDocumentError(userFacingError(err));
    }
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
                className="border border-line bg-surface px-3 py-2"
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
                    className="min-h-11 border border-ink bg-ink px-4 py-2 text-sm text-paper"
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
            <label htmlFor="profile-name" className="grid gap-1 text-sm">
              Name
              <input
                id="profile-name"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
            </label>
            <label htmlFor="profile-email" className="grid gap-1 text-sm">
              Email
              <input
                id="profile-email"
                name="email"
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
            </label>
            <label htmlFor="profile-education" className="grid gap-1 text-sm">
              Education
              <select
                id="profile-education"
                name="educationLevel"
                value={form.educationLevel}
                onChange={(e) => setForm({ ...form, educationLevel: e.target.value as EducationLevel })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              >
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
                name="fieldOfStudy"
                required
                value={form.fieldOfStudy}
                onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label htmlFor="profile-graduation-year" className="grid gap-1 text-sm">
                Graduation year
                <input
                  id="profile-graduation-year"
                  name="graduationYear"
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })}
                  className="min-h-11 border border-line bg-surface px-3 py-2"
                />
              </label>
              <label htmlFor="profile-years-experience" className="grid gap-1 text-sm">
                Years of experience
                <input
                  id="profile-years-experience"
                  name="yearsExperience"
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
                  className="min-h-11 border border-line bg-surface px-3 py-2"
                />
                <span className="text-muted">Shown here only. Postgres v1 stores the experience text, not this number.</span>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label htmlFor="profile-country" className="grid gap-1 text-sm">
                Country
                <input
                  id="profile-country"
                  name="country"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="min-h-11 border border-line bg-surface px-3 py-2"
                />
              </label>
              <label htmlFor="profile-city" className="grid gap-1 text-sm">
                City
                <input
                  id="profile-city"
                  name="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="min-h-11 border border-line bg-surface px-3 py-2"
                />
              </label>
            </div>
            <label htmlFor="profile-languages" className="grid gap-1 text-sm">
              Languages
              <input
                id="profile-languages"
                name="languages"
                required
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
              <span className="text-muted">Comma separated.</span>
            </label>
            <label htmlFor="profile-hulum-language" className="grid gap-1 text-sm">
              HULUM language
              <select
                id="profile-hulum-language"
                name="preferredLanguage"
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as LanguageCode })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="profile-skills" className="grid gap-1 text-sm">
              Skills
              <input
                id="profile-skills"
                name="skills"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
            </label>
            <label htmlFor="profile-experience" className="grid gap-1 text-sm">
              Experience
              <textarea
                id="profile-experience"
                name="experience"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="min-h-24 border border-line bg-surface px-3 py-2"
              />
            </label>
            <label htmlFor="profile-interests" className="grid gap-1 text-sm">
              Interests
              <input
                id="profile-interests"
                name="interests"
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                className="min-h-11 border border-line bg-surface px-3 py-2"
              />
            </label>
            <button type="submit" disabled={saving} className="min-h-11 bg-ink px-5 py-3 text-paper disabled:opacity-60">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>

          <div className="mt-8 grid gap-3 border-t border-line pt-8">
            <h2 className="font-display text-2xl">Documents you already have</h2>
            <p className="text-sm text-muted">
              Upload a photo or PDF of a document you hold — CV, transcript, passport. The name you
              give it is what HULUM compares for required documents. Readable text from the file
              supports experience and field evidence during Analyze; it does not rewrite your saved
              profile fields, and OCR alone never marks a requirement MET.
            </p>
            {documentError ? (
              <StatusPanel variant="error" title="We couldn't store that document">
                {documentError}
              </StatusPanel>
            ) : null}
            <form className="grid gap-3" onSubmit={(event) => void uploadDocument(event)}>
              <label className="grid gap-1 text-sm">
                Document name
                <input
                  value={documentLabel}
                  onChange={(e) => setDocumentLabel(e.target.value)}
                  placeholder="CV, Transcript, Passport"
                  maxLength={80}
                  className="min-h-11 border border-line bg-surface px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                Photo or PDF
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
                  className="min-h-11 border border-line bg-surface px-3 py-2 file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-paper"
                />
              </label>
              <button
                type="submit"
                disabled={documentUploading}
                className="min-h-11 border border-ink px-5 py-3 disabled:opacity-60"
              >
                {documentUploading ? "Uploading…" : "Add document photo"}
              </button>
            </form>
            {documents.length === 0 ? (
              <p className="text-sm text-muted">No document photos stored yet.</p>
            ) : (
              <ul className="grid gap-3">
                {documents.map((doc) => (
                  <li key={doc.id} className="grid gap-2 border border-line p-3 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                    {previews[doc.id] ? (
                      <img src={previews[doc.id]} alt="" className="h-24 w-28 object-cover" />
                    ) : (
                      <div className="flex h-24 w-28 items-center justify-center bg-line text-xs text-muted">
                        {doc.mimeType === "application/pdf" ? "PDF" : "Photo"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      <p className="text-xs text-muted">{doc.mimeType.replace("image/", "").toUpperCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeDocument(doc.id)}
                      className="min-h-11 border border-line px-3 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
