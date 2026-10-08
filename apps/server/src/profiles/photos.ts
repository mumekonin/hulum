import { z } from "zod";
import { dbQuery } from "../db/rls-session.js";
import { HttpError } from "../http/errors.js";

export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export type PhotoMime = (typeof PHOTO_MIME_TYPES)[number];

/** One display-only photo per user. Never read by decide() or document matching. */
export type PhotoStore = {
  updatedAt(userId: string): Promise<string | null>;
  get(userId: string): Promise<{ mimeType: string; bytes: Buffer; updatedAt: string } | undefined>;
  put(input: {
    userId: string;
    mimeType: PhotoMime;
    bytes: Buffer;
  }): Promise<{ updatedAt: string }>;
  remove(userId: string): Promise<boolean>;
};

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

export function createPgPhotoStore(): PhotoStore {
  return {
    async updatedAt(userId) {
      try {
        const result = await dbQuery<{ updated_at: Date | string }>(
          `select updated_at from profile_photos where user_id = $1`,
          [userId],
        );
        const row = result.rows[0];
        return row === undefined ? null : iso(row.updated_at);
      } catch (error) {
        if (isPgError(error) && error.code === "42P01") return null;
        throw error;
      }
    },

    async get(userId) {
      const result = await dbQuery<{ mime_type: string; bytes: Buffer; updated_at: Date | string }>(
        `select mime_type, bytes, updated_at from profile_photos where user_id = $1`,
        [userId],
      );
      const row = result.rows[0];
      if (row === undefined) return undefined;
      return { mimeType: row.mime_type, bytes: row.bytes, updatedAt: iso(row.updated_at) };
    },

    async put(input) {
      try {
        const result = await dbQuery<{ updated_at: Date | string }>(
          `insert into profile_photos (user_id, mime_type, bytes)
           values ($1, $2, $3)
           on conflict (user_id) do update set
             mime_type = excluded.mime_type,
             bytes = excluded.bytes,
             updated_at = now()
           returning updated_at`,
          [input.userId, input.mimeType, input.bytes],
        );
        const row = result.rows[0];
        if (row === undefined) throw new Error("Failed to store profile photo");
        return { updatedAt: iso(row.updated_at) };
      } catch (error) {
        if (isPgError(error) && error.code === "23503") {
          throw new HttpError(404, "NOT_FOUND", "Sign in first, then add a profile photo.");
        }
        if (isPgError(error) && error.code === "42P01") {
          throw new HttpError(
            503,
            "DATABASE_UNAVAILABLE",
            "Profile photos need database migration 017. Run npm run db:migrate, then try again.",
          );
        }
        throw error;
      }
    },

    async remove(userId) {
      const result = await dbQuery(`delete from profile_photos where user_id = $1`, [userId]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}

const photoSchema = z.object({
  mimeType: z.enum(PHOTO_MIME_TYPES),
  fileBase64: z.string().min(24).max(3_000_000),
});

export function parsePhotoUpload(body: unknown): { mimeType: PhotoMime; bytes: Buffer } {
  const parsed = photoSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(422, "INVALID_INPUT", "Use a JPG, PNG, or WebP photo under 2 MB.");
  }
  const compact = parsed.data.fileBase64.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(compact)) {
    throw new HttpError(422, "INVALID_INPUT", "The photo file was not valid.");
  }
  const bytes = Buffer.from(compact, "base64");
  if (bytes.length === 0 || bytes.length > MAX_PHOTO_BYTES) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Use a JPG, PNG, or WebP photo under 2 MB.");
  }
  if (!matchesMime(bytes, parsed.data.mimeType)) {
    throw new HttpError(422, "INVALID_INPUT", "That file isn't a JPG, PNG, or WebP image.");
  }
  return { mimeType: parsed.data.mimeType, bytes };
}

/** Checks the file signature so a non-image can't be served back with an image type. */
function matchesMime(bytes: Buffer, mimeType: PhotoMime): boolean {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") {
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}
