"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  PatchProfileRequest,
  ProfileCompletenessField,
  ProfileDocument,
  ProfileView,
} from "@hulum/shared";
import { api, apiBlob, isNotFound, userFacingError } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { needsOnboarding } from "@/lib/post-auth";
import {
  checkCvFile,
  checkDocumentFile,
  completionPercent,
  CV_LABEL,
  documentFileName,
  educationLabel,
  FIELD_INPUT_IDS,
  fileToDocumentPayload,
  findCv,
  isCvDocument,
  profileHeadline,
  splitList,
} from "@/lib/profile-form";
import { PROFILE_FIELD_LABELS } from "@/lib/text-actions";
import { getLanguage, getUserId, setLanguage, setSessionToken } from "@/lib/storage";
import { StatusPanel } from "@/components/StatusPanel";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";
import {
  CvCard,
  OtherDocuments,
  type DocumentFeedback,
} from "@/components/profile/ProfileDocuments";
import { ProfileEditForm, type ProfileForm } from "@/components/profile/ProfileEditForm";

function formFrom(view: ProfileView): ProfileForm {
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

function patchFrom(form: ProfileForm): PatchProfileRequest {
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

const card = "border border-line bg-surface p-5 sm:p-7";

function SectionHeading({ id, title, onEdit }: { id: string; title: string; onEdit?: () => void }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="font-display text-2xl">
        {title}
      </h2>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="min-h-11 px-1 text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink"
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  const shown = value?.trim();
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className={`mt-1.5 break-words text-lg leading-7 ${shown ? "" : "text-muted"}`}>
        {shown || "Not added"}
      </dd>
    </div>
  );
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex min-h-9 items-center border border-line-strong bg-paper px-3 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ProfilePage() {
  const [boot, setBoot] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState<ProfileView | null>(null);
  const [editing, setEditing] = useState(false);
  const [focusField, setFocusField] = useState<ProfileCompletenessField | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [documentsState, setDocumentsState] = useState<"loading" | "ready" | "error">("loading");
  const [documentsKey, setDocumentsKey] = useState(0);
  const [documentBusy, setDocumentBusy] = useState<string | null>(null);
  const [cvFeedback, setCvFeedback] = useState<DocumentFeedback>(null);
  const [docFeedback, setDocFeedback] = useState<DocumentFeedback>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const editHeadingRef = useRef<HTMLHeadingElement>(null);
  const busyRef = useRef(false);

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
    if (userId === null) return;
    let cancelled = false;
    setDocumentsState("loading");
    void api<ProfileDocument[]>(`/api/profile/${userId}/documents`)
      .then((items) => {
        if (cancelled) return;
        setDocuments(items);
        setDocumentsState("ready");
      })
      .catch(() => {
        if (!cancelled) setDocumentsState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [documentsKey, reloadKey]);

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
    if (!editing) return;
    const target = focusField ? document.getElementById(FIELD_INPUT_IDS[focusField]) : null;
    if (target) {
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
    } else {
      editHeadingRef.current?.focus();
    }
  }, [editing, focusField]);

  useEffect(() => {
    if (notice === null) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function startEditing(field: ProfileCompletenessField | null = null) {
    if (view === null) return;
    setForm(formFrom(view));
    setSaveError(null);
    setNotice(null);
    setFocusField(field);
    setEditing(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const userId = getUserId();
    if (form === null || userId === null || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api<ProfileView>(`/api/profile/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(patchFrom(form)),
      });
      if (saved.sessionToken) setSessionToken(saved.sessionToken);
      setLanguage(form.preferredLanguage);
      setView(saved);
      setEditing(false);
      setNotice("Profile updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSaveError(userFacingError(err));
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File, label: string, replacesId?: string): Promise<ProfileDocument> {
    const userId = getUserId();
    if (userId === null) throw new Error("Sign in again to upload.");
    const payload = await fileToDocumentPayload(file);
    return api<ProfileDocument>(`/api/profile/${userId}/documents`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        label,
        fileName: file.name,
        ...(replacesId ? { replacesId } : {}),
        ...payload,
      }),
    });
  }

  /** One document operation at a time; repeated clicks while busy are ignored. */
  async function withDocument(
    key: string,
    setFeedback: (value: DocumentFeedback) => void,
    work: () => Promise<string | null>,
  ): Promise<boolean> {
    if (busyRef.current) return false;
    busyRef.current = true;
    setDocumentBusy(key);
    setFeedback(null);
    try {
      const done = await work();
      if (done) setFeedback({ kind: "done", text: done });
      return true;
    } catch (err) {
      setFeedback({ kind: "error", text: userFacingError(err) });
      return false;
    } finally {
      busyRef.current = false;
      setDocumentBusy(null);
    }
  }

  function swapDocument(created: ProfileDocument, replacedId?: string) {
    setDocuments((current) => [created, ...current.filter((item) => item.id !== replacedId)]);
  }

  function uploadCv(file: File | undefined) {
    if (file === undefined) return;
    const problem = checkCvFile(file);
    if (problem) {
      setCvFeedback({ kind: "error", text: problem });
      return;
    }
    const previous = cv;
    void withDocument("cv", setCvFeedback, async () => {
      const created = await upload(file, CV_LABEL, previous?.id);
      swapDocument(created, previous?.id);
      return previous ? "CV updated successfully." : "CV uploaded successfully.";
    });
  }

  async function removeDocument(doc: ProfileDocument, setFeedback: (v: DocumentFeedback) => void) {
    const userId = getUserId();
    if (userId === null) return;
    await withDocument(`remove-${doc.id}`, setFeedback, async () => {
      await api<{ deleted: boolean }>(`/api/profile/${userId}/documents/${doc.id}`, {
        method: "DELETE",
      });
      setDocuments((current) => current.filter((item) => item.id !== doc.id));
      return isCvDocument(doc) ? "CV removed." : `${doc.label} removed.`;
    });
  }

  async function openDocument(
    doc: ProfileDocument,
    download: boolean,
    setFeedback: (v: DocumentFeedback) => void,
  ) {
    const userId = getUserId();
    if (userId === null || busyRef.current) return;
    const target = download ? null : window.open("", "_blank");
    await withDocument(
      download ? `download-${doc.id}` : `view-${doc.id}`,
      setFeedback,
      async () => {
        let blob: Blob;
        try {
          blob = await apiBlob(`/api/profile/${userId}/documents/${doc.id}`);
        } catch (err) {
          target?.close();
          throw err;
        }
        const url = URL.createObjectURL(blob);
        if (download) {
          const link = document.createElement("a");
          link.href = url;
          link.download = documentFileName(doc);
          link.click();
        } else if (target) {
          target.location.href = url;
        } else {
          window.location.assign(url);
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return null;
      },
    );
  }

  async function addDocument(label: string, file: File | undefined): Promise<boolean> {
    if (label === "") {
      setDocFeedback({
        kind: "error",
        text: "Name the document first, for example Transcript or Passport.",
      });
      return false;
    }
    if (file === undefined) {
      setDocFeedback({ kind: "error", text: "Choose a photo or PDF first." });
      return false;
    }
    const problem = checkDocumentFile(file);
    if (problem) {
      setDocFeedback({ kind: "error", text: problem });
      return false;
    }
    return withDocument("add", setDocFeedback, async () => {
      swapDocument(await upload(file, label));
      return `${label} added.`;
    });
  }

  function replaceDocument(doc: ProfileDocument, file: File | undefined) {
    if (file === undefined) return;
    const problem = checkDocumentFile(file);
    if (problem) {
      setDocFeedback({ kind: "error", text: problem });
      return;
    }
    void withDocument(`replace-${doc.id}`, setDocFeedback, async () => {
      swapDocument(await upload(file, doc.label, doc.id), doc.id);
      return `${doc.label} updated.`;
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
  const userId = getUserId();
  if (boot === "missing" || view === null || userId === null) {
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
  const missing = view.completeness.missing;
  const percent = completionPercent(missing);
  const headline = profileHeadline(profile);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const replyLanguage = LANGUAGE_OPTIONS.find((option) => option.code === getLanguage())?.label;
  const identityLine = [location, profile.languages.join(", ")].filter(Boolean).join(" · ");
  const firstMissing = missing[0] ?? null;

  return (
    <section data-wide-page className="w-full">
      <header className="border border-line bg-surface">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <ProfilePhoto
            userId={userId}
            name={view.name}
            photoUpdatedAt={view.photoUpdatedAt ?? null}
            onChange={(photoUpdatedAt) =>
              setView((current) => (current ? { ...current, photoUpdatedAt } : current))
            }
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Your profile
            </h1>
            <p className="mt-2 break-words font-display text-4xl leading-tight sm:text-5xl">
              {view.name}
            </p>
            <p className={`mt-2 text-lg ${headline ? "" : "text-muted"}`}>
              {headline ?? "Add your field of study and education level"}
            </p>
            {identityLine ? <p className="mt-1 text-muted">{identityLine}</p> : null}
            <p className="mt-1 break-all text-sm text-muted">{view.email}</p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => startEditing()}
              className="min-h-11 shrink-0 self-start bg-ink px-5 text-paper transition-opacity hover:opacity-90 sm:self-center"
            >
              Edit profile
            </button>
          ) : null}
        </div>

        <div className="border-t border-line px-5 py-5 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm">Profile completeness</p>
            <p className="font-display text-3xl leading-none" aria-hidden>
              {percent}%
            </p>
          </div>
          <div
            className="mt-3 h-1.5 bg-line"
            role="progressbar"
            aria-label="Profile completion"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-1.5 bg-ink transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {missing.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-sm text-muted">
                Missing: {missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field).join(", ")}.
                HULUM treats missing facts as uncertain, never guessed.
              </p>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => startEditing(firstMissing)}
                  className="min-h-11 shrink-0 self-start text-sm underline underline-offset-4 hover:text-ink sm:self-auto"
                >
                  Add missing details
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Every profile fact HULUM uses is filled in.</p>
          )}
        </div>
      </header>

      <p role="status" className={`text-sm text-apply ${notice ? "mt-4" : ""}`}>
        {notice ?? ""}
      </p>

      {needsOnboarding(view) && !editing ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-l-2 border-ink bg-surface-muted px-4 py-3 text-sm">
          <p>Your profile isn&apos;t set up yet, so HULUM can&apos;t judge your fit well.</p>
          <Link href="/onboarding" className="underline underline-offset-4">
            Finish setup
          </Link>
        </div>
      ) : null}

      {editing && form ? (
        <ProfileEditForm
          form={form}
          setForm={setForm}
          saving={saving}
          saveError={saveError}
          onSubmit={(event) => void save(event)}
          onCancel={() => setEditing(false)}
          headingRef={editHeadingRef}
        />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="about-heading" className={`${card} lg:col-span-2`}>
            <SectionHeading
              id="about-heading"
              title="Education"
              onEdit={() => startEditing("educationLevel")}
            />
            <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              <Fact label="Education level" value={educationLabel(profile.educationLevel)} />
              <Fact label="Field of study" value={profile.fieldOfStudy} />
              <Fact
                label="Graduation year"
                value={profile.graduationYear === null ? null : String(profile.graduationYear)}
              />
              <Fact label="Location" value={location} />
            </dl>
          </section>

          <section aria-labelledby="skills-heading" className={`${card} lg:col-span-2`}>
            <SectionHeading
              id="skills-heading"
              title="Skills & experience"
              onEdit={() => startEditing("skills")}
            />
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Skills
                </h3>
                <div className="mt-3">
                  <Chips items={profile.skills} empty="No skills added yet." />
                </div>
              </div>
              <div className="md:border-l md:border-line md:pl-8">
                <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Experience
                </h3>
                <p
                  className={`mt-3 whitespace-pre-line leading-7 ${profile.experience?.trim() ? "" : "text-muted"}`}
                >
                  {profile.experience?.trim() || "No experience added yet."}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="interests-heading" className={card}>
            <SectionHeading
              id="interests-heading"
              title="Interests"
              onEdit={() => startEditing("interests")}
            />
            <div className="mt-4">
              <Chips items={profile.interests} empty="No interests added yet." />
            </div>
          </section>

          <section aria-labelledby="languages-heading" className={card}>
            <SectionHeading
              id="languages-heading"
              title="Languages"
              onEdit={() => startEditing("languages")}
            />
            <div className="mt-4">
              <Chips items={profile.languages} empty="No languages added yet." />
            </div>
            <dl className="mt-5 border-t border-line pt-4">
              <Fact label="HULUM reply language" value={replyLanguage} />
            </dl>
          </section>
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {documentsState !== "ready" ? (
          <section
            aria-labelledby="cv-heading"
            className="border border-line-strong bg-surface p-5 sm:p-8 lg:col-span-2"
            aria-busy={documentsState === "loading"}
          >
            <h2 id="cv-heading" className="font-display text-3xl">
              CV
            </h2>
            {documentsState === "loading" ? (
              <div className="mt-6 h-[5.5rem] border border-line bg-paper motion-safe:animate-pulse">
                <span className="sr-only">Loading your CV and documents…</span>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
                <p role="alert" className="text-sm">
                  We couldn&apos;t load your CV and documents. Nothing was changed.
                </p>
                <button
                  type="button"
                  onClick={() => setDocumentsKey((value) => value + 1)}
                  className="inline-flex min-h-11 items-center border border-line-strong px-4 text-sm hover:border-ink"
                >
                  Try again
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <CvCard
              cv={cv}
              busy={documentBusy}
              feedback={cvFeedback}
              onUpload={uploadCv}
              onOpen={(doc, download) => void openDocument(doc, download, setCvFeedback)}
              onRemove={(doc) => void removeDocument(doc, setCvFeedback)}
            />

            <OtherDocuments
              documents={otherDocuments}
              previews={previews}
              busy={documentBusy}
              feedback={docFeedback}
              onAdd={addDocument}
              onReplace={replaceDocument}
              onOpen={(doc, download) => void openDocument(doc, download, setDocFeedback)}
              onRemove={(doc) => void removeDocument(doc, setDocFeedback)}
            />
          </>
        )}
      </div>
    </section>
  );
}
