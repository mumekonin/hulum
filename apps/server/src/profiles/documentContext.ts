import type { Profile } from "@hulum/shared";
import type { DocumentStore } from "./documents.js";
import { formatDocumentTextBag } from "./documentExtract.js";

/**
 * Attach cached uploaded-document text for decide(). Does not rewrite saved profile fields.
 */
export async function profileForDecision(
  profile: Profile,
  documents: Pick<DocumentStore, "ensureExtracted" | "texts">,
): Promise<Profile> {
  await documents.ensureExtracted(profile.userId);
  const rows = await documents.texts(profile.userId);
  const documentText = formatDocumentTextBag(rows);
  if (documentText === "") {
    return { ...profile };
  }
  return { ...profile, documentText };
}
