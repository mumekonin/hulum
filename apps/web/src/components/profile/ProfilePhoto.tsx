"use client";

import { useEffect, useRef, useState } from "react";
import { api, apiBlob, userFacingError } from "@/lib/api";
import { initialsOf } from "@/lib/account";
import { checkPhotoFile, PHOTO_ACCEPT, preparePhotoUpload } from "@/lib/profile-form";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; text: string }
  | { kind: "done"; text: string }
  | { kind: "error"; text: string };

export function ProfilePhoto({
  userId,
  name,
  photoUpdatedAt,
  onChange,
}: {
  userId: string;
  name: string;
  photoUpdatedAt: string | null;
  onChange: (photoUpdatedAt: string | null) => void;
}) {
  const [url, setUrlState] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedFor = useRef<string | null>(null);
  const currentUrl = useRef<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const hasPhoto = url !== null || (photoUpdatedAt !== null && !loadFailed);
  const loading = photoUpdatedAt !== null && url === null && !loadFailed;
  const busy = status.kind === "busy";

  function setUrl(next: string | null, { revokePrevious = true } = {}) {
    if (revokePrevious && currentUrl.current && currentUrl.current !== next) {
      URL.revokeObjectURL(currentUrl.current);
    }
    currentUrl.current = next;
    setUrlState(next);
  }

  useEffect(() => {
    if (photoUpdatedAt === null) {
      loadedFor.current = null;
      setUrl(null);
      return;
    }
    if (loadedFor.current === photoUpdatedAt) return;
    let cancelled = false;
    setLoadFailed(false);
    void apiBlob(`/api/profile/${userId}/photo`)
      .then((blob) => {
        if (cancelled) return;
        loadedFor.current = photoUpdatedAt;
        setUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (cancelled) return;
        setUrl(null);
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, photoUpdatedAt]);

  useEffect(
    () => () => {
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (status.kind !== "done") return;
    const timer = window.setTimeout(() => setStatus({ kind: "idle" }), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function choose(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (file === undefined || busy) return;
    const problem = checkPhotoFile(file);
    if (problem) {
      setStatus({ kind: "error", text: problem });
      return;
    }
    setStatus({ kind: "busy", text: "Uploading photo…" });
    const previous = currentUrl.current;
    let preview: string | null = null;
    try {
      const prepared = await preparePhotoUpload(file);
      preview = URL.createObjectURL(prepared.blob);
      setUrl(preview, { revokePrevious: false });
      const saved = await api<{ photoUpdatedAt: string }>(`/api/profile/${userId}/photo`, {
        method: "POST",
        body: JSON.stringify({ mimeType: prepared.mimeType, fileBase64: prepared.fileBase64 }),
      });
      if (previous) URL.revokeObjectURL(previous);
      loadedFor.current = saved.photoUpdatedAt;
      onChange(saved.photoUpdatedAt);
      setStatus({ kind: "done", text: "Profile photo updated." });
    } catch (err) {
      if (preview) URL.revokeObjectURL(preview);
      currentUrl.current = previous;
      setUrlState(previous);
      setStatus({ kind: "error", text: userFacingError(err) });
    }
  }

  async function removePhoto() {
    if (busy) return;
    setStatus({ kind: "busy", text: "Removing photo…" });
    try {
      await api<{ deleted: boolean }>(`/api/profile/${userId}/photo`, { method: "DELETE" });
      loadedFor.current = null;
      setUrl(null);
      onChange(null);
      setStatus({ kind: "done", text: "Profile photo removed." });
    } catch (err) {
      setStatus({ kind: "error", text: userFacingError(err) });
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-center">
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group flex flex-col items-center gap-2 disabled:cursor-progress"
      >
        <span className="relative block h-28 w-28 sm:h-32 sm:w-32">
          <span
            className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-line-strong bg-surface-muted ${loading ? "motion-safe:animate-pulse" : ""}`}
          >
            {url ? (
              <img
                src={url}
                alt={`Profile photo of ${name}`}
                className={`h-full w-full object-cover transition-opacity ${busy ? "opacity-60" : ""}`}
              />
            ) : loading ? null : (
              <span aria-hidden className="font-display text-4xl text-muted">
                {initialsOf(name)}
              </span>
            )}
          </span>
          <span
            aria-hidden
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-ink text-paper transition-transform group-hover:scale-105 group-disabled:scale-100"
          >
            <CameraIcon />
          </span>
        </span>
        <span className="text-sm underline decoration-line-strong underline-offset-4 group-hover:decoration-ink">
          {busy ? status.text : hasPhoto ? "Change photo" : "Add photo"}
        </span>
      </button>
      {url !== null && !busy ? (
        <button
          type="button"
          onClick={() => void removePhoto()}
          className="text-xs text-muted underline underline-offset-4 hover:text-ink"
        >
          Remove photo
        </button>
      ) : null}
      <p
        role={status.kind === "error" ? "alert" : "status"}
        className={`max-w-[12rem] text-xs sm:text-center ${status.kind === "error" ? "text-skip" : "text-apply"}`}
      >
        {status.kind === "done" || status.kind === "error" ? status.text : ""}
      </p>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2l1.4 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  );
}
