import type { Decision, LanguageCode, Opportunity, RequirementStatus } from "@hulum/shared";
import type { TextActionResult } from "./text-actions";

export type ChatLink = { label: string; href: string; external?: boolean };
export type ChatPrompt = { label: string; text: string };

export type DecisionCard = {
  kind: "decision";
  decision: Decision;
  title?: string;
  why: string[];
  check: string[];
  notMet: string[];
  nextAction: string;
};

export type ListCard = {
  kind: "list";
  items: Array<Pick<Opportunity, "id" | "title" | "organization" | "deadline">>;
  total: number;
};

export type BatchCard = {
  kind: "batch";
  rows: Array<{ opportunityId: string; analysisId: string; title: string; decision: Decision }>;
  failed: string[];
};

export type ChatCard = DecisionCard | ListCard | BatchCard;

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "hulum";
      text: string;
      card?: ChatCard;
      links?: ChatLink[];
      prompts?: ChatPrompt[];
    };

export type HulumMessage = Extract<ChatMessage, { role: "hulum" }>;

/** Analyze returns `Requirement` (text); voice returns `RequirementResult` (requirementText). */
type AnyRequirement = {
  key: string;
  status: RequirementStatus;
  text?: string;
  requirementText?: string;
};

function requirementLabel(item: AnyRequirement): string {
  return (item.text ?? item.requirementText ?? "").trim() || item.key;
}

let counter = 0;
export function messageId(): string {
  counter += 1;
  return `m${Date.now().toString(36)}${counter}`;
}

export function opportunityHref(opportunityId: string, analysisId?: string): string {
  return `/opportunities/${opportunityId}${analysisId ? `?analysisId=${analysisId}` : ""}`;
}

/** Official links only from stored URLs; applicationUrl wins when present. */
export function officialLink(opportunity: Opportunity): ChatLink {
  return opportunity.applicationUrl
    ? { label: "Open application", href: opportunity.applicationUrl, external: true }
    : { label: "View official source", href: opportunity.sourceUrl, external: true };
}

/**
 * Cards already show the structured data, so English replies get a short lead instead of the
 * long spoken template. Explanations and non-English replies keep the server's own text.
 */
function leadFor(
  result: TextActionResult,
  language: LanguageCode,
  title: string | undefined,
): string {
  if (language !== "en") return result.reply;
  if (result.analysis && (result.intent === undefined || result.intent === "ANALYZE_OPPORTUNITY")) {
    return `Based on your profile, HULUM classifies ${title ?? "this opportunity"} as ${result.analysis.decision}.`;
  }
  if (
    !result.analysis &&
    result.opportunities &&
    result.opportunities.length > 0 &&
    result.intent !== "FILTER_BY_DECISION"
  ) {
    const total = result.opportunities.length;
    return `I found ${total} stored ${total === 1 ? "opportunity" : "opportunities"}.`;
  }
  return result.reply;
}

export function hulumMessageFrom(result: TextActionResult, language: LanguageCode): HulumMessage {
  const opportunity =
    result.opportunity ??
    (result.analysis && "opportunity" in result.analysis ? result.analysis.opportunity : undefined);
  const base: HulumMessage = {
    id: messageId(),
    role: "hulum",
    text: leadFor(result, language, opportunity?.title),
  };

  if (result.analysis) {
    const requirements: AnyRequirement[] = result.analysis.requirements ?? [];
    const pick = (status: RequirementStatus) =>
      requirements.filter((item) => item.status === status).map(requirementLabel);
    const href = opportunityHref(result.analysis.opportunityId, result.analysis.id);
    return {
      ...base,
      card: {
        kind: "decision",
        decision: result.analysis.decision,
        ...(opportunity ? { title: opportunity.title } : {}),
        why: pick("MET"),
        check: pick("UNCERTAIN"),
        notMet: pick("NOT_MET"),
        nextAction: result.analysis.nextAction,
      },
      links: [
        { label: "View opportunity", href },
        { label: "See readiness", href: `${href}#readiness-heading` },
        ...(opportunity ? [officialLink(opportunity)] : []),
      ],
    };
  }

  if (result.opportunities && result.opportunities.length > 0) {
    return {
      ...base,
      card: {
        kind: "list",
        items: result.opportunities.slice(0, 5).map(({ id, title, organization, deadline }) => ({
          id,
          title,
          organization,
          deadline,
        })),
        total: result.opportunities.length,
      },
      links: [{ label: "Open Discover", href: "/opportunities" }],
    };
  }

  if (opportunity) {
    return {
      ...base,
      prompts: [{ label: "Analyze my fit", text: "Should I apply for this?" }],
      links: [
        { label: "View opportunity", href: opportunityHref(opportunity.id) },
        officialLink(opportunity),
      ],
    };
  }

  if (result.intent === "UPDATE_PROFILE") {
    return { ...base, links: [{ label: "Edit profile", href: "/profile" }] };
  }

  return base;
}
