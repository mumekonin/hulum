/**
 * Catalog seed is closed. Live opportunities come from the investigator worker.
 * This function does not insert listings.
 */
export async function seedCatalog(): Promise<{ inserted: number; skipped: number; closed: true }> {
  return { inserted: 0, skipped: 0, closed: true };
}
