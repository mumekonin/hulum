const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterResult = { ok: true } | { ok: false; reason: "invalid" | "failed" };

export function isNewsletterEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Connection point for a newsletter list. HULUM has no subscription store or
 * list mailer yet, so a valid address is not recorded and this does not report success.
 */
export async function subscribeToNewsletter(email: string): Promise<NewsletterResult> {
  if (!isNewsletterEmail(email)) return { ok: false, reason: "invalid" };
  return { ok: false, reason: "failed" };
}
