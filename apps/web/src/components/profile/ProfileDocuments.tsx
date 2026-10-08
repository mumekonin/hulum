"use client";

import { FormEvent, useRef, useState } from "react";
import type { ProfileDocument } from "@hulum/shared";
import {
  DOCUMENT_ACCEPT,
  documentExtension,
  documentFileName,
  uploadedWhen,
} from "@/lib/profile-form";
import { btnGhost, btnPrimary, btnSecondary, fieldClass } from "@/lib/ui";

export type DocumentFeedback = { kind: "done" | "error"; text: string } | null;

const quietButton = btnGhost;
const outlineButton = btnSecondary;
const primaryButton = btnPrimary;

function HiddenFileInput({
  inputRef,
  onFile,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={DOCUMENT_ACCEPT}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        onFile(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );
}

function Feedback({ feedback }: { feedback: DocumentFeedback }) {
  return (
    <p
      role={feedback?.kind === "error" ? "alert" : "status"}
      className={`text-sm ${feedback?.kind === "error" ? "text-skip" : "text-apply"} ${feedback ? "mt-4" : ""}`}
    >
      {feedback?.text ?? ""}
    </p>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  return (
    <span
      aria-hidden
      className="relative flex h-14 w-11 shrink-0 items-end justify-center border border-line-strong bg-paper pb-1.5 text-[10px] font-medium tracking-[0.08em] text-muted"
    >
      <span className="absolute right-[-1px] top-[-1px] h-3 w-3 border-b border-l border-line-strong bg-surface" />
      {documentExtension(mimeType).toUpperCase()}
    </span>
  );
}

export function CvCard({
  cv,
  busy,
  feedback,
  onUpload,
  onOpen,
  onRemove,
}: {
  cv: ProfileDocument | undefined;
  busy: string | null;
  feedback: DocumentFeedback;
  onUpload: (file: File | undefined) => void;
  onOpen: (doc: ProfileDocument, download: boolean) => void;
  onRemove: (doc: ProfileDocument) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = busy === "cv";
  const locked = busy !== null;

  return (
    <section
      aria-labelledby="cv-heading"
      className="border border-line-strong bg-surface p-5 sm:p-8 lg:col-span-2"
    >
      <div className="max-w-2xl">
        <h2 id="cv-heading" className="font-display text-3xl">
          CV
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your CV helps HULUM understand your background when evaluating opportunities. It stays
          private to you and is read only as supporting evidence when you analyze an opportunity.
        </p>
      </div>
      <HiddenFileInput inputRef={inputRef} onFile={onUpload} />

      {cv ? (
        <div className="mt-6 flex flex-col gap-5 border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-4">
            <FileIcon mimeType={cv.mimeType} />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Current CV</p>
              <p className="mt-1 truncate font-medium" title={documentFileName(cv)}>
                {documentFileName(cv)}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {documentExtension(cv.mimeType).toUpperCase()} · {uploadedWhen(cv.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={locked}
              onClick={() => onOpen(cv, false)}
              className={outlineButton}
            >
              {busy === `view-${cv.id}` ? "Opening…" : "View"}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => inputRef.current?.click()}
              className={primaryButton}
            >
              {uploading ? "Uploading CV…" : "Update CV"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 border border-dashed border-line-strong bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">No CV uploaded yet.</p>
            <p className="mt-0.5 text-sm text-muted">
              Upload your CV so HULUM can use it as evidence when you analyze an opportunity.
            </p>
          </div>
          <button
            type="button"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
            className={`${primaryButton} shrink-0`}
          >
            {uploading ? "Uploading CV…" : "Upload CV"}
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-muted">
          PDF preferred · JPG, PNG, or WebP photos also work · up to 4 MB
        </p>
        {cv ? (
          <div className="flex flex-wrap">
            <button
              type="button"
              disabled={locked}
              onClick={() => onOpen(cv, true)}
              className={quietButton}
            >
              Download
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => onRemove(cv)}
              className={quietButton}
            >
              {busy === `remove-${cv.id}` ? "Removing…" : "Remove"}
            </button>
          </div>
        ) : null}
      </div>
      <Feedback feedback={feedback} />
    </section>
  );
}

export function OtherDocuments({
  documents,
  previews,
  busy,
  feedback,
  onAdd,
  onReplace,
  onOpen,
  onRemove,
}: {
  documents: ProfileDocument[];
  previews: Record<string, string>;
  busy: string | null;
  feedback: DocumentFeedback;
  onAdd: (label: string, file: File | undefined) => Promise<boolean>;
  onReplace: (doc: ProfileDocument, file: File | undefined) => void;
  onOpen: (doc: ProfileDocument, download: boolean) => void;
  onRemove: (doc: ProfileDocument) => void;
}) {
  const [label, setLabel] = useState("");
  const addFileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState<ProfileDocument | null>(null);
  const locked = busy !== null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const added = await onAdd(label.trim(), addFileRef.current?.files?.[0]);
    if (added) {
      setLabel("");
      if (addFileRef.current) addFileRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby="documents-heading" className="lg:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <h2 id="documents-heading" className="font-display text-2xl">
          Other documents
        </h2>
        <p className="text-sm text-muted">Supporting evidence · {documents.length} stored</p>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
        Transcripts, certificates, passport. The name you give a document is what HULUM compares
        with required documents. Readable text supports evidence during Analyze; it never marks a
        requirement met on its own.
      </p>

      <HiddenFileInput
        inputRef={replaceRef}
        onFile={(file) => {
          if (replacing) onReplace(replacing, file);
          setReplacing(null);
        }}
      />

      {documents.length > 0 ? (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                {previews[doc.id] ? (
                  <img
                    src={previews[doc.id]}
                    alt=""
                    className="h-14 w-11 shrink-0 border border-line object-cover"
                  />
                ) : (
                  <FileIcon mimeType={doc.mimeType} />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.label}</p>
                  <p className="truncate text-sm text-muted">
                    {documentFileName(doc)} · {uploadedWhen(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onOpen(doc, false)}
                  className={quietButton}
                >
                  {busy === `view-${doc.id}` ? "Opening…" : "View"}
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setReplacing(doc);
                    replaceRef.current?.click();
                  }}
                  className={quietButton}
                >
                  {busy === `replace-${doc.id}` ? "Uploading…" : "Update"}
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onRemove(doc)}
                  className={quietButton}
                >
                  {busy === `remove-${doc.id}` ? "Removing…" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 border-y border-line py-5 text-sm text-muted">
          No supporting documents yet.
        </p>
      )}

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      >
        <label className="grid gap-1 text-sm">
          Document name
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Transcript"
            maxLength={80}
            className={fieldClass}
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          Photo or PDF, up to 4 MB
          <input
            ref={addFileRef}
            type="file"
            accept={DOCUMENT_ACCEPT}
            className={`${fieldClass} file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:text-paper`}
          />
        </label>
        <button type="submit" disabled={locked} className={outlineButton}>
          {busy === "add" ? "Uploading…" : "Add document"}
        </button>
      </form>
      <Feedback feedback={feedback} />
    </section>
  );
}
