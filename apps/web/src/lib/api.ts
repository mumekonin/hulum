const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Envelope<T> = { data: T | null; error: { message: string } | null };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as Envelope<T>;
  if (!response.ok || payload.error || payload.data == null) {
    throw new Error(payload.error?.message ?? "Something went wrong. Try again.");
  }
  return payload.data;
}

export { API_URL };
