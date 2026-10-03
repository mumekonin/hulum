import type { ProfileDocument } from "@hulum/shared";
import { z } from "zod";
import { dbQuery } from "../db/rls-session.js";
import { HttpError } from "../http/errors.js";
import {
  extractDocumentText,
  formatDocumentTextBag,
  type DocumentTextRow,
  type ExtractStatus,
} from "./documentExtract.js";

export const DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_DOCUMENTS_PER_USER = 8;
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

export type ProfileDocumentRow = {
  id: string;
  user_id: string;
  label: string;
  mime_type: string;
  bytes: Buffer;
  created_at: Date | string;
  extracted_text?: string | null;
  extracted_at?: Date | string | null;
  extract_status?: ExtractStatus;
};

export type DocumentStore = {
  list(userId: string): Promise<ProfileDocument[]>;
  labels(userId: string): Promise<string[]>;
  texts(userId: string): Promise<DocumentTextRow[]>;
  ensureExtracted(userId: string): Promise<void>;
  create(input: { userId: string; label: string; mimeType: string; bytes: Buffer }): Promise<ProfileDocument>;
  getFile(userId: string, documentId: string): Promise<{ mimeType: string; bytes: Buffer } | undefined>;
  remove(userId: string, documentId: string): Promise<boolean>;
};

function toView(row: Omit<ProfileDocumentRow, "bytes">): ProfileDocument {
  const created = row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    mimeType: row.mime_type,
    createdAt: created,
  };
}

async function saveExtract(
  documentId: string,
  result: { text: string | null; status: ExtractStatus },
): Promise<void> {
  await dbQuery(
    `update profile_documents
     set extracted_text = $2,
         extracted_at = now(),
         extract_status = $3
     where id = $1`,
    [documentId, result.text, result.status],
  );
}

export function createPgDocumentStore(): DocumentStore {
  return {
    async list(userId: string): Promise<ProfileDocument[]> {
      const result = await dbQuery<Omit<ProfileDocumentRow, "bytes">>(
        `select id, user_id, label, mime_type, created_at
         from profile_documents
         where user_id = $1
         order by created_at desc`,
        [userId],
      );
      return result.rows.map(toView);
    },

    async labels(userId: string): Promise<string[]> {
      const result = await dbQuery<{ label: string }>(
        `select label from profile_documents where user_id = $1 order by created_at asc`,
        [userId],
      );
      const out: string[] = [];
      for (const row of result.rows) {
        if (!out.includes(row.label)) {
          out.push(row.label);
        }
      }
      return out;
    },

    async texts(userId: string): Promise<DocumentTextRow[]> {
      const result = await dbQuery<{ label: string; extracted_text: string }>(
        `select label, extracted_text
         from profile_documents
         where user_id = $1
           and extract_status = 'ready'
           and extracted_text is not null
           and length(trim(extracted_text)) > 0
         order by created_at asc`,
        [userId],
      );
      return result.rows.map((row) => ({ label: row.label, text: row.extracted_text }));
    },

    async ensureExtracted(userId: string): Promise<void> {
      const result = await dbQuery<Pick<ProfileDocumentRow, "id" | "mime_type" | "bytes" | "extract_status">>(
        `select id, mime_type, bytes, extract_status
         from profile_documents
         where user_id = $1
           and extract_status in ('pending', 'failed')`,
        [userId],
      );
      for (const row of result.rows) {
        const extracted = await extractDocumentText({
          mimeType: row.mime_type,
          bytes: row.bytes,
        });
        await saveExtract(row.id, extracted);
      }
    },

    async create(input): Promise<ProfileDocument> {
      const count = await dbQuery<{ n: string }>(
        `select count(*)::text as n from profile_documents where user_id = $1`,
        [input.userId],
      );
      if (Number(count.rows[0]?.n ?? "0") >= MAX_DOCUMENTS_PER_USER) {
        throw new HttpError(400, "INVALID_INPUT", "You can store at most 8 document photos.");
      }
      if (input.bytes.length > MAX_DOCUMENT_BYTES) {
        throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Each document photo must be 4 MB or smaller.");
      }
      try {
        const result = await dbQuery<Omit<ProfileDocumentRow, "bytes">>(
          `insert into profile_documents (user_id, label, mime_type, bytes, extract_status)
           values ($1, $2, $3, $4, 'pending')
           returning id, user_id, label, mime_type, created_at`,
          [input.userId, input.label, input.mimeType, input.bytes],
        );
        const row = result.rows[0];
        if (row === undefined) {
          throw new Error("Failed to store document");
        }
        try {
          const extracted = await extractDocumentText({
            mimeType: input.mimeType,
            bytes: input.bytes,
          });
          await saveExtract(row.id, extracted);
        } catch {
          await saveExtract(row.id, { text: null, status: "failed" });
        }
        return toView(row);
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        if (isPgError(error) && error.code === "23503") {
          throw new HttpError(404, "NOT_FOUND", "Sign in first, then upload document photos.");
        }
        throw error;
      }
    },

    async getFile(userId: string, documentId: string): Promise<{ mimeType: string; bytes: Buffer } | undefined> {
      const result = await dbQuery<Pick<ProfileDocumentRow, "mime_type" | "bytes">>(
        `select mime_type, bytes from profile_documents where id = $1 and user_id = $2`,
        [documentId, userId],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      return { mimeType: row.mime_type, bytes: row.bytes };
    },

    async remove(userId: string, documentId: string): Promise<boolean> {
      const result = await dbQuery(
        `delete from profile_documents where id = $1 and user_id = $2`,
        [documentId, userId],
      );
      return (result.rowCount ?? 0) > 0;
    },
  };
}

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

const MAX_BASE64_CHARS = 6_000_000;

const uploadSchema = z.object({
  label: z.string().trim().min(1).max(80),
  mimeType: z.enum(DOCUMENT_MIME_TYPES),
  fileBase64: z.string().min(24).max(MAX_BASE64_CHARS),
});

export function parseDocumentUpload(body: unknown): {
  label: string;
  mimeType: (typeof DOCUMENT_MIME_TYPES)[number];
  bytes: Buffer;
} {
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(
      422,
      "INVALID_INPUT",
      "Upload a JPEG, PNG, WebP, or PDF (4 MB or smaller) and name the document.",
    );
  }
  const compact = parsed.data.fileBase64.replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(compact)) {
    throw new HttpError(422, "INVALID_INPUT", "The document file was not valid.");
  }
  const bytes = Buffer.from(compact, "base64");
  if (bytes.length === 0 || bytes.length > MAX_DOCUMENT_BYTES) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Each document photo must be 4 MB or smaller.");
  }
  return { label: parsed.data.label, mimeType: parsed.data.mimeType, bytes };
}

export { formatDocumentTextBag };
export type { DocumentTextRow };
