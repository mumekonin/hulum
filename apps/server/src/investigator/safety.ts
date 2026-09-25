const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

export function hostnameOf(raw: string): string | undefined {
  try {
    return new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./, "").toLowerCase();
  if (PRIVATE_HOSTS.has(host)) {
    return true;
  }
  if (host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split(".").map(Number);
    const a = parts[0] ?? 0;
    const b = parts[1] ?? 0;
    if (a === 10 || a === 0 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

export function assertSafeHttpUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("URL is not valid.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must be http or https.");
  }
  if (parsed.username !== "" || parsed.password !== "") {
    throw new Error("URL must not include credentials.");
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new Error("URL host is not allowed.");
  }
  return parsed;
}

export function isAllowedOfficialUrl(raw: string, officialDomains: string[]): boolean {
  const host = hostnameOf(raw);
  if (host === undefined || isBlockedHost(host)) {
    return false;
  }
  return officialDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function isAllowedFetchUrl(raw: string, fetchHosts: string[]): boolean {
  try {
    const parsed = assertSafeHttpUrl(raw);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return fetchHosts.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/** Public http(s) only. Used for discovered listing pages, including aggregators. */
export function isSafePublicHttpUrl(raw: string): boolean {
  try {
    assertSafeHttpUrl(raw);
    return true;
  } catch {
    return false;
  }
}

export function isLeadHost(host: string, leadHosts: string[]): boolean {
  const normalized = host.replace(/^www\./, "").toLowerCase();
  return leadHosts.some((domain) => {
    const lead = domain.replace(/^www\./, "").toLowerCase();
    return normalized === lead || normalized.endsWith(`.${lead}`);
  });
}
