export function formatDeadline(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function requirementLines(value: string | string[] | null | undefined): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => item.trim()).filter((item) => item !== "");
}

export function daysUntil(value: string): number | null {
  const date = new Date(`${value}T23:59:59`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
