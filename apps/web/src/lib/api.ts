const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Envelope<T> = { data: T | null; error: { message: string; code?: string } | null };

const NETWORK_MESSAGE = "We couldn't reach HULUM. Check your connection and try again.";
const FALLBACK_MESSAGE = "Something went wrong. Try again.";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 404;
}

export function userFacingError(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) {
    if (/failed to fetch|networkerror|econnrefused|load failed/i.test(error.message)) {
      return NETWORK_MESSAGE;
    }
    return error.message || FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiClientError(NETWORK_MESSAGE, 0, "NETWORK");
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    throw new ApiClientError(FALLBACK_MESSAGE, response.status, "INVALID_RESPONSE");
  }

  if (!response.ok || payload.error || payload.data == null) {
    throw new ApiClientError(
      payload.error?.message ?? FALLBACK_MESSAGE,
      response.status,
      payload.error?.code,
    );
  }

  return payload.data;
}

export { API_URL };
