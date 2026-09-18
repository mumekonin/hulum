"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EDUCATION_LABELS, EDUCATION_LEVELS, type EducationLevel, type Profile } from "@hulum/shared";
import { api } from "@/lib/api";
import { getUserId, setUserId } from "@/lib/storage";
import { Notice } from "@/components/Notice";

const emptyForm = {
  name: "",
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    void api<Profile>(`/api/profile/${userId}`)
      .then((profile) => {
        setForm({
          name: profile.name,
          educationLevel: profile.educationLevel,
          fieldOfStudy: profile.fieldOfStudy,
          graduationYear: profile.graduationYear,
          country: profile.country,
          city: profile.city ?? "",
          languages: profile.languages.join(", "),
          skills: profile.skills.join(", "),
          experience: profile.experience,
          yearsExperience: profile.yearsExperience,
          interests: profile.interests.join(", "),
          documentsHeld: profile.documentsHeld.join(", "),
        });
      })
      .catch(() => undefined);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      const profile = await api<Profile>("/api/profile", {
        method: "POST",
        body: JSON.stringify({
          userId: userId ?? undefined,
          name: form.name,
          educationLevel: form.educationLevel,
          fieldOfStudy: form.fieldOfStudy,
          graduationYear: Number(form.graduationYear),
          country: form.country,
          city: form.city || undefined,
          languages: splitList(form.languages),
          skills: splitList(form.skills),
          experience: form.experience,
          yearsExperience: Number(form.yearsExperience),
          interests: splitList(form.interests),
          documentsHeld: splitList(form.documentsHeld),
          preferredLanguage: "en",
        }),
      });
      setUserId(profile.userId);
      setSaved(true);
      router.push("/opportunities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDemo() {
    setLoading(true);
    setError(null);
    try {
      const profile = await api<Profile>("/api/profile/demo", { method: "POST" });
      setUserId(profile.userId);
      router.push("/opportunities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the demo profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl">Your profile</h1>
      <p className="mt-3 text-muted">HULUM only compares what you declare here with structured opportunity requirements.</p>
      <div className="mt-6">
        <Notice>
          Authentication is intentionally light in v0.1 so the decision loop is not blocked. Use the demo
          Computer Science student if you want the STARK walkthrough.
        </Notice>
      </div>
      {error ? <p className="mt-4 text-skip">{error}</p> : null}
      {saved ? <p className="mt-4 text-apply">Profile saved.</p> : null}
      <button type="button" onClick={() => void loadDemo()} className="mt-6 border border-ink px-4 py-2 text-sm">
        Use demo profile (Abeba Tesfaye)
      </button>
      <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4">
        <label className="grid gap-1 text-sm">
          Name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-line bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Education
          <select
            value={form.educationLevel}
            onChange={(e) => setForm({ ...form, educationLevel: e.target.value as EducationLevel })}
            className="border border-line bg-white px-3 py-2"
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
          <input required value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} className="border border-line bg-white px-3 py-2" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Graduation year
            <input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: Number(e.target.value) })} className="border border-line bg-white px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Years of experience
            <input type="number" min={0} step={0.5} value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })} className="border border-line bg-white px-3 py-2" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Country
            <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="border border-line bg-white px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            City
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-line bg-white px-3 py-2" />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Languages (comma separated)
          <input required value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="border border-line bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Skills
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="border border-line bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Experience
          <textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="min-h-24 border border-line bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Interests
          <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="border border-line bg-white px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Documents you already have
          <input value={form.documentsHeld} onChange={(e) => setForm({ ...form, documentsHeld: e.target.value })} placeholder="CV, Transcript" className="border border-line bg-white px-3 py-2" />
        </label>
        <button disabled={loading} className="bg-ink px-5 py-3 text-paper disabled:opacity-60">
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}
