"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { ScreenshotAnalyzeResult, ScreenshotExtracted } from "@hulum/shared";
import { Notice } from "@/components/Notice";
import { StatusPanel } from "@/components/StatusPanel";
import { api, userFacingError } from "@/lib/api";
import { requirementLines } from "@/lib/format";
import { getUserId } from "@/lib/storage";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extractedRequirementLines(extracted: ScreenshotExtracted): string[] {
  return [
    ...requirementLines(extracted.countryEligibility),
    ...requirementLines(extracted.educationRequirements),
    ...requirementLines(extracted.fieldRequirements),
    ...requirementLines(extracted.experienceRequirements),
    ...requirementLines(extracted.languageRequirements),
    ...requirementLines(extracted.documentRequirements),
  ];
}

function ScreenshotRequirements({ extracted }: { extracted: ScreenshotExtracted }) {
  const listed = extractedRequirementLines(extracted);
  return (
    <div className="mt-4">
      <h3 className="font-display text-xl">Requirements</h3>
      {listed.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          No requirements were visible in the photo. HULUM does not invent them.
        </p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
          {listed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fileToPayload(file: File): Promise<{ mimeType: "image/jpeg" | "image/png" | "image/webp"; imageBase64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      const header = comma >= 0 ? result.slice(0, comma) : "";
      const imageBase64 = comma >= 0 ? result.slice(comma + 1) : "";
      const mimeMatch = header.match(/data:(image\/(?:jpeg|png|webp));base64/i);
      const mimeType = mimeMatch?.[1];
      if (mimeType !== "image/jpeg" && mimeType !== "image/png" && mimeType !== "image/webp") {
        reject(new Error("Use a JPEG, PNG, or WebP screenshot."));
        return;
      }
      if (imageBase64.trim() === "") {
        reject(new Error("Could not read that photo."));
        return;
      }
      resolve({ mimeType, imageBase64 });
    };
    reader.readAsDataURL(file);
  });
}

export default function ScreenshotPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenshotAnalyzeResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = getUserId();
    if (userId === null) {
      setError("Sign in and save a profile first.");
      return;
    }
    const input = event.currentTarget.elements.namedItem("screenshot") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file === undefined) {
      setError("Choose a screenshot first.");
      return;
    }
    if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) {
      setError("Use a JPEG, PNG, or WebP photo under 4 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const payload = await fileToPayload(file);
      const data = await api<ScreenshotAnalyzeResult>("/api/ai/screenshot-analyze", {
        method: "POST",
        body: JSON.stringify({ userId, ...payload }),
      });
      setResult(data);
    } catch (err) {
      setError(userFacingError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl">Analyze a screenshot</h1>
      <p className="mt-3 text-muted">
        Saw a post on Telegram or LinkedIn? Upload the photo. HULUM reads only what is visible, then the
        engine decides APPLY / MAYBE / SKIP. It does not invent a deadline or apply link.
      </p>
      <div className="mt-6">
        <Notice>
          This stays on your account. It is not added to the public catalog. Confirm everything on the
          official organization page before you apply.
        </Notice>
      </div>

      <form className="mt-8 grid gap-4" onSubmit={(event) => void onSubmit(event)}>
        <label className="grid gap-1 text-sm" htmlFor="screenshot">
          Screenshot
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="min-h-11 border border-line bg-white px-3 py-2"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? null);
              setResult(null);
              if (preview) {
                URL.revokeObjectURL(preview);
              }
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
        {fileName ? <p className="text-sm text-muted">{fileName}</p> : null}
        {preview ? (
          <img src={preview} alt="Selected screenshot preview" className="max-h-64 w-auto border border-line" />
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 border border-ink bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
        >
          {busy ? "Reading screenshot…" : "Analyze screenshot"}
        </button>
      </form>

      {error ? (
        <div className="mt-6">
          <StatusPanel variant="error" title="We couldn't analyze that photo">
            {error}
          </StatusPanel>
        </div>
      ) : null}

      {result ? (
        <div className="mt-10 grid gap-4">
          <Notice>{result.notice}</Notice>
          <div className="border border-line p-4">
            <h2 className="font-display text-2xl">What HULUM could read</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-muted">Title</dt>
                <dd>{result.extracted.title ?? "Not visible"}</dd>
              </div>
              <div>
                <dt className="text-muted">Organization</dt>
                <dd>{result.extracted.organization ?? "Not visible"}</dd>
              </div>
              <div>
                <dt className="text-muted">Deadline</dt>
                <dd>{result.extracted.deadline ?? "Not visible — not invented"}</dd>
              </div>
              <div>
                <dt className="text-muted">Official / apply link</dt>
                <dd>
                  {result.extracted.applicationUrl ?? result.extracted.sourceUrl ?? "Not visible — not invented"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Description</dt>
                <dd>{result.extracted.description ?? "Not visible"}</dd>
              </div>
            </dl>
            <ScreenshotRequirements extracted={result.extracted} />
          </div>
          {result.decision ? (
            <div className="border border-line p-4">
              <h2 className="font-display text-2xl">{result.decision.decision}</h2>
              <p className="mt-2 text-sm">{result.decision.summary}</p>
              <p className="mt-2 text-sm text-muted">{result.decision.nextAction}</p>
              {result.decision.missing.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-medium">Needs attention</h3>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {result.decision.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">No APPLY / MAYBE / SKIP yet — the photo did not have enough facts, or you still need a profile.</p>
          )}
          <Link href="/opportunities" className="text-sm underline">
            Back to the catalog
          </Link>
        </div>
      ) : null}
    </section>
  );
}
