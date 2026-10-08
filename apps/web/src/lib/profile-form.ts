import {
  EDUCATION_LABELS,
  PROFILE_COMPLETENESS_FIELDS,
  type EducationLevel,
  type Profile,
  type ProfileCompletenessField,
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

export const CV_FILE_PROBLEM =
  "Please upload your CV as a PDF (or a JPG, PNG, or WebP photo) under 4 MB.";

export function checkCvFile(file: File): string | null {
  return checkDocumentFile(file) === null ? null : CV_FILE_PROBLEM;
}

export function documentExtension(mimeType: string): string {
  return mimeType === "application/pdf" ? "pdf" : mimeType.replace("image/", "").replace("jpeg", "jpg");
}

/** The user's own file name when stored; older uploads fall back to the label. */
export function documentFileName(doc: Pick<ProfileDocument, "label" | "mimeType" | "fileName">): string {
  return doc.fileName?.trim() || `${doc.label}.${documentExtension(doc.mimeType)}`;
}

export function uploadedWhen(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "Uploaded";
  const day = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((day(now) - day(then)) / 86_400_000);
  if (days <= 0) return "Uploaded today";
  if (days === 1) return "Uploaded yesterday";
  return `Uploaded ${then.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** Edit-form control for each completeness field, so "Add missing details" can focus it. */
export const FIELD_INPUT_IDS: Record<ProfileCompletenessField, string> = {
  educationLevel: "profile-education",
  fieldOfStudy: "profile-field",
  graduationYear: "profile-graduation-year",
  country: "profile-country",
  city: "profile-city",
  languages: "profile-languages",
  skills: "profile-skills",
  experience: "profile-experience",
  interests: "profile-interests",
};

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const MAX_PHOTO_INPUT_BYTES = 8 * 1024 * 1024;
const PHOTO_EDGE = 512;

export function checkPhotoFile(file: File): string | null {
  const mime = mimeFromFile(file);
  if (mime === null || mime === "application/pdf") return "Use a JPG, PNG, or WebP image.";
  if (file.size > MAX_PHOTO_INPUT_BYTES) return "That image is over 8 MB. Use a smaller one.";
  return null;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Center-crops to a 512px square and re-encodes in the browser. Re-encoding also drops
 * camera metadata such as GPS location before anything leaves the device.
 */
export async function preparePhotoUpload(
  file: File,
): Promise<{ mimeType: "image/webp" | "image/jpeg"; fileBase64: string; blob: Blob }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("We couldn't read that image. Try a different JPG, PNG, or WebP file.");
  }
  const side = Math.min(bitmap.width, bitmap.height);
  const edge = Math.min(PHOTO_EDGE, side);
  const canvas = document.createElement("canvas");
  canvas.width = edge;
  canvas.height = edge;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("We couldn't prepare that image.");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    edge,
    edge,
  );
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.88));
  let blob = await encode("image/webp");
  if (blob === null || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (blob === null) throw new Error("We couldn't prepare that image.");
  const mimeType = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  return { mimeType, fileBase64: await blobToBase64(blob), blob };
}

/** Built only from saved facts, e.g. "Computer Science · Bachelor's (in progress)". */
export function profileHeadline(profile: Profile): string | null {
  const parts = [profile.fieldOfStudy?.trim(), educationLabel(profile.educationLevel)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}
