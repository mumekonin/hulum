/** The results currently shown on Discover, so Ask HULUM can answer "which of these should I apply for?". */

const DISCOVER_CONTEXT_KEY = "hulum.discover.context";
export const DISCOVER_CONTEXT_LIMIT = 10;

export type DiscoverContext = {
  query: string;
  items: Array<{ id: string; title: string }>;
  total: number;
};

export function writeDiscoverContext(context: DiscoverContext): void {
  try {
    window.sessionStorage.setItem(
      DISCOVER_CONTEXT_KEY,
      JSON.stringify({ ...context, items: context.items.slice(0, DISCOVER_CONTEXT_LIMIT) }),
    );
  } catch {
    // Storage disabled: Ask HULUM simply has no search context.
  }
}

export function readDiscoverContext(): DiscoverContext | null {
  try {
    const raw = window.sessionStorage.getItem(DISCOVER_CONTEXT_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as Partial<DiscoverContext>;
    if (
      !Array.isArray(parsed.items) ||
      typeof parsed.query !== "string" ||
      typeof parsed.total !== "number"
    ) {
      return null;
    }
    const items = parsed.items.filter(
      (item): item is { id: string; title: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.title === "string",
    );
    return { query: parsed.query, items, total: parsed.total };
  } catch {
    return null;
  }
}
