export type ProfileDocument = {
  id: string;
  userId: string;
  label: string;
  mimeType: string;
  /** Name of the file as the user chose it; null for uploads stored before names were kept. */
  fileName?: string | null;
  createdAt: string;
};
