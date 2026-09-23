function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** The quoted sentence must appear in the fetched page. Missing facts stay rejected. */
export function pageContainsEvidence(pageText: string, evidence: string | null | undefined): boolean {
  if (evidence === undefined || evidence === null) {
    return false;
  }
  const needle = normalize(evidence);
  if (needle.length < 8) {
    return false;
  }
  return normalize(pageText).includes(needle);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
