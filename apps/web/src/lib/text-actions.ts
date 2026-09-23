import {
  type Analysis,
  type Opportunity,
  type OpportunityType,
  type ProfileView,
  type ReadinessItem,
} from "@hulum/shared";
import { api } from "./api";

export type TextActionResult = {
  reply: string;
  opportunityId?: string;
  analysisId?: string;
};

const TYPE_WORDS: Array<[RegExp, OpportunityType]> = [
  [/\binternship/i, "internship"],
  [/\bscholarship/i, "scholarship"],
  [/\bfellowship/i, "fellowship"],
  [/\bgrant/i, "grant"],
  [/\bjob|remote job/i, "job"],
  [/\bcompetition/i, "competition"],
];

const PROFILE_FIELD_LABELS: Record<string, string> = {
  educationLevel: "education level",
  fieldOfStudy: "field of study",
  graduationYear: "graduation year",
  country: "country",
  city: "city",
  languages: "languages",
  skills: "skills",
  experience: "experience",
  interests: "interests",
};

function formatProfileGapsReply(missing: string[]): string {
  if (missing.length === 0) {
    return "Your profile looks complete for v0.1 matching. You can still edit details on the profile page.";
  }
  const labels = missing.map((field) => PROFILE_FIELD_LABELS[field] ?? field);
  return `Your profile is missing: ${labels.join(", ")}. Open your profile to add them before analyzing. Voice cannot silently change stored facts.`;
}

function decisionWord(value: string): "APPLY" | "MAYBE" | "SKIP" | undefined {
  if (/\bmaybe\b/i.test(value)) return "MAYBE";
  if (/\bskip\b/i.test(value)) return "SKIP";
  if (/\bapply\b/i.test(value)) return "APPLY";
  return undefined;
}

function listReply(items: Opportunity[]): string {
  if (items.length === 0) return "No stored opportunities matched. HULUM does not invent listings.";
  return items
    .slice(0, 5)
    .map((item) => `${item.title} — ${item.organization}`)
    .join("; ");
}

function requirementLine(item: { text?: string; status: string; reason: string | null }): string {
  return `${item.text ?? "Requirement"} (${item.status})${item.reason ? `: ${item.reason}` : ""}`;
}

export async function runTextAction(input: {
  text: string;
  userId: string;
  opportunityId?: string;
  analysisId?: string;
}): Promise<TextActionResult> {
  const value = input.text.trim();
  const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));

  if (/(show|list|filter)/i.test(value) && decisionWord(value)) {
    if (!input.analysisId) {
      return {
        reply: "Analyze an opportunity first. This screen does not list every past decision.",
      };
    }
    const analysis = await api<Analysis>(`/api/analyses/${input.analysisId}`);
    const wanted = decisionWord(value);
    const matches = analysis.decision === wanted;
    return {
      reply: matches
        ? `This analysis is ${analysis.decision}. ${analysis.nextAction}`
        : `This analysis is ${analysis.decision}, not ${wanted}. ${analysis.nextAction}`,
      analysisId: analysis.id,
      opportunityId: analysis.opportunityId,
    };
  }

  if (/ለዚህ እድል ማመልከት|should i apply|analyze|analyse|\bfit\b/i.test(value)) {
    if (!input.opportunityId) {
      return { reply: "Open an opportunity first, then ask whether to apply." };
    }
    const analysis = await api<Analysis>(`/api/opportunities/${input.opportunityId}/analyze`, {
      method: "POST",
      body: JSON.stringify({ userId: input.userId }),
    });
    return {
      reply: `${analysis.decision}. ${analysis.summary} Next: ${analysis.nextAction}`,
      analysisId: analysis.id,
      opportunityId: analysis.opportunityId,
    };
  }

  if (/ለምን|why (apply|maybe|skip|did you)|explain|^why\b/i.test(value)) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first. Explanation follows a stored decision." };
    }
    try {
      const explained = await api<{ decision: string; explanation: string }>(
        `/api/analyses/${input.analysisId}/explain`,
        { method: "POST", body: JSON.stringify({ language: "en" }) },
      );
      return {
        reply: `${explained.decision}. ${explained.explanation}`,
        analysisId: input.analysisId,
        opportunityId: input.opportunityId,
      };
    } catch {
      const analysis = await api<Analysis>(`/api/analyses/${input.analysisId}`);
      return {
        reply: `${analysis.decision}. ${analysis.summary}`,
        analysisId: analysis.id,
        opportunityId: analysis.opportunityId,
      };
    }
  }

  // Profile gaps before generic "what am I missing" (opportunity requirements).
  if (
    /profile\s*(gap|gaps|incomplete|missing)|missing from my profile|what.*(incomplete|missing).*profile|profile.*(incomplete|missing)/i.test(
      value,
    )
  ) {
    try {
      const view = await api<ProfileView>(`/api/profile/${input.userId}`);
      return { reply: formatProfileGapsReply(view.completeness.missing) };
    } catch {
      return { reply: "Create a profile first so HULUM can list missing fields." };
    }
  }

  if (
    /clarif(y|ication)|which requirements.*(uncertain|unclear)|explain.*(uncertain|unclear).*requirement/i.test(
      value,
    )
  ) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first, then ask to clarify uncertain requirements." };
    }
    const analysis = await api<Analysis>(`/api/analyses/${input.analysisId}`);
    const uncertain = (analysis.requirements ?? []).filter((item) => item.status === "UNCERTAIN");
    return {
      reply: uncertain.length
        ? `These requirements are UNCERTAIN — confirm them on the official source before treating them as met: ${uncertain.map(requirementLine).join("; ")}`
        : "No UNCERTAIN requirements are stored for this analysis. Confirm any doubt on the official source; HULUM is not the organization.",
      analysisId: analysis.id,
      opportunityId: analysis.opportunityId,
    };
  }

  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing/i.test(value)) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first, then ask what is missing." };
    }
    const analysis = await api<Analysis>(`/api/analyses/${input.analysisId}`);
    const gaps = (analysis.requirements ?? []).filter((item) => item.status !== "MET" && item.status !== "NOT_APPLICABLE");
    return {
      reply: gaps.length === 0 ? "No missing or uncertain requirements on this analysis." : gaps.map(requirementLine).join(" "),
      analysisId: analysis.id,
      opportunityId: analysis.opportunityId,
    };
  }

  if (/ምን ላዘጋጅ|what should i prepare|readiness|checklist|prepare/i.test(value)) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first, then ask what to prepare." };
    }
    const items = await api<ReadinessItem[]>(`/api/analyses/${input.analysisId}/readiness`);
    return {
      reply:
        items.length === 0
          ? "This analysis has no readiness items."
          : items.map((item) => `${item.title} (${item.status})`).join("; "),
      analysisId: input.analysisId,
      opportunityId: input.opportunityId,
    };
  }

  if (/update profile|change profile|edit profile/i.test(value)) {
    return { reply: "Open your profile and save the facts there. Voice does not write profile facts." };
  }

  if (typeHit && /show|list|find|filter|internships|scholarships/i.test(value)) {
    const opportunities = await api<Opportunity[]>("/api/opportunities");
    const filtered = opportunities.filter((item) => item.type === typeHit[1]);
    return { reply: listReply(filtered), opportunityId: filtered[0]?.id };
  }

  if (/show|list|opportunities|እድሎች/i.test(value)) {
    const opportunities = await api<Opportunity[]>("/api/opportunities");
    return { reply: listReply(opportunities), opportunityId: opportunities[0]?.id };
  }

  if (/open|details|tell me about this|about this opportunity|current opportunity/i.test(value)) {
    if (!input.opportunityId) {
      return { reply: "Open an opportunity first, then ask about it." };
    }
    const item = await api<Opportunity>(`/api/opportunities/${input.opportunityId}`);
    const decision = input.analysisId
      ? (await api<Analysis>(`/api/analyses/${input.analysisId}`)).decision
      : undefined;
    const stored = decision ? ` Stored HULUM decision: ${decision}.` : "";
    return {
      reply: `${item.title} — ${item.organization}. Type ${item.type}. Deadline ${item.deadline}. Official source: ${item.sourceUrl}.${stored} Confirm details on the official page.`,
      opportunityId: item.id,
      analysisId: input.analysisId,
    };
  }

  return {
    reply: "That request is not one of the product actions. Use a quick action, or open an opportunity and analyze it.",
  };
}
