"use client";

import { FormEvent, useState } from "react";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  type LanguageCode,
  type ProfileExtractResult,
} from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { PROFILE_FIELD_LABELS } from "@/lib/text-actions";
import { voiceLauncherClearance } from "@/lib/voxide";
import { StatusPanel } from "@/components/StatusPanel";

export type ProfileForm = {
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

const inputClass =
  "min-h-11 w-full border border-line-strong bg-surface px-3 py-2 focus:border-ink";
const secondaryButton =
  "inline-flex min-h-11 items-center border border-line-strong px-3 text-sm transition-colors hover:border-ink disabled:opacity-60";
const card = "border border-line bg-surface p-5 sm:p-7";
const legend = "font-display text-2xl";

export function ProfileEditForm({
  form,
  setForm,
  saving,
  saveError,
  onSubmit,
  onCancel,
  headingRef,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm | null>>;
  saving: boolean;
  saveError: string | null;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [extractText, setExtractText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProfileExtractResult | null>(null);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => (current === null ? current : { ...current, [key]: value }));
  }

  async function runExtract() {
    setExtracting(true);
    setExtractError(null);
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
      setExtractError(userFacingError(err));
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

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 grid gap-6 lg:grid-cols-2"
      aria-describedby={saveError ? "profile-save-error" : undefined}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 lg:col-span-2">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl outline-none">
          Edit profile
        </h2>
        <p className="text-sm text-muted">
          Name and email come from your account and can&apos;t be changed here.
        </p>
      </div>

      {saveError ? (
        <div id="profile-save-error" className="lg:col-span-2">
          <StatusPanel variant="error" title="We couldn't save your profile">
            {saveError}
          </StatusPanel>
        </div>
      ) : null}

      <details className="border border-line bg-surface-muted/50 p-4 lg:col-span-2">
        <summary className="cursor-pointer text-sm font-medium">
          Fill from a description of yourself
        </summary>
        <div className="mt-4 grid gap-3">
          <p className="text-sm text-muted">
            Paste a short description. HULUM proposes details; you review them before anything is
            saved.
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
          {extractError ? (
            <p role="alert" className="text-sm text-skip">
              {extractError}
            </p>
          ) : null}
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
                  className="min-h-11 bg-ink px-4 text-sm text-paper"
                >
                  Use these in the form
                </button>
                <button type="button" onClick={() => setProposal(null)} className={secondaryButton}>
                  Discard
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </details>

      <fieldset className={`${card} grid gap-4 sm:grid-cols-2 lg:col-span-2`}>
        <legend className="sr-only">Education and location</legend>
        <p aria-hidden className={`${legend} sm:col-span-2`}>
          Education &amp; location
        </p>
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
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </fieldset>

      <fieldset className={`${card} grid gap-4 lg:col-span-2 lg:grid-cols-2`}>
        <legend className="sr-only">Skills and experience</legend>
        <div className="flex flex-wrap items-baseline justify-between gap-2 lg:col-span-2">
          <p aria-hidden className={legend}>
            Skills &amp; experience
          </p>
          <p className="text-sm text-muted">Separate items with commas.</p>
        </div>
        <label htmlFor="profile-skills" className="grid content-start gap-1 text-sm">
          Skills
          <input
            id="profile-skills"
            value={form.skills}
            onChange={(event) => update("skills", event.target.value)}
            className={inputClass}
            placeholder="Python, React, Data analysis"
          />
        </label>
        <label htmlFor="profile-experience" className="grid gap-1 text-sm">
          Experience
          <textarea
            id="profile-experience"
            value={form.experience}
            onChange={(event) => update("experience", event.target.value)}
            rows={4}
            className={`${inputClass} min-h-28`}
          />
        </label>
      </fieldset>

      <fieldset className={`${card} grid content-start gap-4`}>
        <legend className="sr-only">Interests</legend>
        <p aria-hidden className={legend}>
          Interests
        </p>
        <label htmlFor="profile-interests" className="grid gap-1 text-sm">
          Interests
          <input
            id="profile-interests"
            value={form.interests}
            onChange={(event) => update("interests", event.target.value)}
            className={inputClass}
            placeholder="AI, scholarships, climate"
          />
        </label>
      </fieldset>

      <fieldset className={`${card} grid content-start gap-4`}>
        <legend className="sr-only">Languages</legend>
        <p aria-hidden className={legend}>
          Languages
        </p>
        <label htmlFor="profile-languages" className="grid gap-1 text-sm">
          Languages you speak
          <input
            id="profile-languages"
            value={form.languages}
            onChange={(event) => update("languages", event.target.value)}
            className={inputClass}
            placeholder="English, Amharic"
          />
        </label>
        <label htmlFor="profile-hulum-language" className="grid gap-1 text-sm">
          HULUM reply language
          <select
            id="profile-hulum-language"
            value={form.preferredLanguage}
            onChange={(event) => update("preferredLanguage", event.target.value as LanguageCode)}
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

      <div
        className={`sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-line bg-paper py-4 lg:col-span-2 ${voiceLauncherClearance()}`}
      >
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 bg-ink px-5 text-paper disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-11 px-2 text-muted underline underline-offset-4 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
