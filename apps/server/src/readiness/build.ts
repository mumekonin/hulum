import { ReadinessStatus, RequirementKey, RequirementStatus, type RequirementMatch } from "@hulum/shared";

export type DraftReadinessItem = {
  title: string;
  description: string | null;
  status: typeof ReadinessStatus.TODO | typeof ReadinessStatus.NOT_REQUIRED;
  priority: number;
};

const FALLBACK_DOCUMENT_LABEL = "Document requirement";

function documentNames(match: RequirementMatch): string[] {
  return match.text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && part !== FALLBACK_DOCUMENT_LABEL);
}

/**
 * Deterministic checklist. Documents and unresolved requirements become TODO.
 * MET and NOT_APPLICABLE non-document rows are omitted. Claude does not write items.
 */
export function buildReadinessItems(matches: RequirementMatch[]): DraftReadinessItem[] {
  const items: DraftReadinessItem[] = [];
  let priority = 1;

  const documents = matches.find((match) => match.key === RequirementKey.DOCUMENTS);
  if (documents !== undefined) {
    if (documents.status === RequirementStatus.NOT_APPLICABLE) {
      items.push({
        title: "No extra documents listed",
        description: documents.reason,
        status: ReadinessStatus.NOT_REQUIRED,
        priority,
      });
      priority += 1;
    } else {
      const names = documentNames(documents);
      const labels = names.length > 0 ? names : ["required documents"];
      for (const name of labels) {
        items.push({
          title: `Prepare ${name}`,
          description: documents.reason,
          status: ReadinessStatus.TODO,
          priority,
        });
        priority += 1;
      }
    }
  }

  for (const match of matches) {
    if (match.key === RequirementKey.DOCUMENTS) {
      continue;
    }
    if (match.status === RequirementStatus.MET || match.status === RequirementStatus.NOT_APPLICABLE) {
      continue;
    }
    items.push({
      title: `Resolve the ${match.key} requirement`,
      description: match.reason,
      status: ReadinessStatus.TODO,
      priority,
    });
    priority += 1;
  }

  return items;
}
