/** Strip credential-shaped text so logs and API errors never echo secrets. */
const SECRET_PATTERNS: readonly RegExp[] = [
  /postgres(?:ql)?:\/\/\S+/gi,
  /[?&](?:password|token|apikey|api_key)=[^&\s]+/gi,
  /bearer\s+\S+/gi,
  /\bgsk_[A-Za-z0-9_-]+/gi,
  /\bvox_(?!pub_)[A-Za-z0-9_-]+/gi,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi,
];

export function redactSecrets(text: string): string {
  let redacted = text;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, "[redacted]");
  }
  return redacted;
}
