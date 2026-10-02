import {
  EDUCATION_LABELS,
  PROFILE_COMPLETENESS_FIELDS,
  type EducationLevel,
  type Profile,
  type ProfileDocument,
} from "@hulum/shared";

export type DocumentMime = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export const DOCUMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";
export const CV_LABEL = "CV";

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mimeFromFile(file: File): DocumentMime | null {
  if (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "application/pdf"
  ) {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".pdf")) return "application/pdf";
  return null;
}

/** Returns an error message, or null when the file can be uploaded. */
export function checkDocumentFile(file: File): string | null {
  if (mimeFromFile(file) === null) return "Use a JPEG, PNG, WebP photo, or a PDF.";
  if (file.size > MAX_DOCUMENT_BYTES) return "That file is over 4 MB. Use a smaller file.";
  return null;
}

export function fileToDocumentPayload(
  file: File,
): Promise<{ mimeType: DocumentMime; fileBase64: string }> {
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

export function isCvDocument(doc: Pick<ProfileDocument, "label">): boolean {
  return /\b(cv|resume|résumé|curriculum vitae)\b/i.test(doc.label);
}

/** Newest CV first; documents come back newest-first from the API. */
export function findCv(documents: ProfileDocument[]): ProfileDocument | undefined {
  return documents.find(isCvDocument);
}

export function completionPercent(missing: readonly string[]): number {
  const total = PROFILE_COMPLETENESS_FIELDS.length;
  return Math.round(((total - missing.length) / total) * 100);
}

export function educationLabel(value: string | null): string | null {
  if (value === null || value.trim() === "") return null;
  return EDUCATION_LABELS[value as EducationLevel] ?? value;
}

/** Built only from saved facts, e.g. "Computer Science · Bachelor's (in progress)". */
export function profileHeadline(profile: Profile): string | null {
  const parts = [profile.fieldOfStudy?.trim(), educationLabel(profile.educationLevel)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}
