import {
  detectAskedLanguage,
  type Analysis,
  type LanguageCode,
  type Opportunity,
  type OpportunityType,
  type ProfileView,
  type ReadinessItem,
  type VoiceActionResponse,
} from "@hulum/shared";
import { api } from "./api";
import { getLanguage } from "./storage";

export type TextActionResult = {
  reply: string;
  opportunityId?: string;
  analysisId?: string;
};

const TYPE_WORDS: Array<[RegExp, OpportunityType]> = [
  [/\binternship|ኢንተርንሺፕ|internshipwwan|hojii barumsaa/i, "internship"],
  [/\bscholarship|ስኮላርሺፕ|ስኮለርሺፕ|scholarshipwwan|carraa barumsaa/i, "scholarship"],
  // fellowship — am: ፌሎሺፕ, om: fellowshipwwan / carraa qorannoo
  [/\bfellowship|ፌሎሺፕ|fellowshipwwan|carraa qorannoo/i, "fellowship"],
  [/\bgrant|grantii/i, "grant"],
  [/\bjob|remote job|hojii/i, "job"],
  [/\bcompetition|dorgommii/i, "competition"],
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

function listReply(items: Opportunity[], language: LanguageCode = "en", type?: string): string {
  if (items.length === 0) {
    if (language === "am") return "መታወፅ እድል አልተገኘም። HULUM እድል አይፈጥርም።";
    if (language === "om") return "Carraan kuufame hin argamne. HULUM carraa hin uumne.";
    return "No stored opportunities matched. HULUM does not invent listings.";
  }
  const titles = items
    .slice(0, 5)
    .map((item) => `${item.title} — ${item.organization}`)
    .join("; ");
  if (type === "fellowship") {
    if (language === "am") return `ፌሎሺፕ: ${titles}`;
    if (language === "om") return `Fellowshipwwan: ${titles}`;
    return `Fellowships: ${titles}`;
  }
  if (type === "scholarship") {
    if (language === "am") return `ስኮላርሺፕ: ${titles}`;
    if (language === "om") return `Scholarshipwwan: ${titles}`;
    return `Scholarships: ${titles}`;
  }
  if (type === "internship") {
    if (language === "am") return `ኢንተርንሺፕ: ${titles}`;
    if (language === "om") return `Internshipwwan: ${titles}`;
    return `Internships: ${titles}`;
  }
  if (language === "am") return `የአሁን እድሎች: ${titles}`;
  if (language === "om") return `Carraawwan amma jiran: ${titles}`;
  return `Here are current opportunities: ${titles}`;
}

function requirementLine(item: { text?: string; status: string; reason: string | null }): string {
  return `${item.text ?? "Requirement"} (${item.status})${item.reason ? `: ${item.reason}` : ""}`;
}

export async function runTextAction(input: {
  text: string;
  userId: string;
  opportunityId?: string;
  analysisId?: string;
  language?: LanguageCode;
}): Promise<TextActionResult> {
  const value = input.text.trim();
  const language: LanguageCode = detectAskedLanguage(value, input.language ?? getLanguage());
  const typeHit = TYPE_WORDS.find(([pattern]) => pattern.test(value));

  if (
    !/personalized readiness|personalize.*(plan|readiness|checklist)|readiness plan/i.test(value) &&
    !/clarif(y|ication)|which requirements.*(uncertain|unclear)|explain.*(uncertain|unclear).*requirement/i.test(
      value,
    )
  ) {
    try {
      const voice = await api<VoiceActionResponse>("/api/voice/action", {
        method: "POST",
        body: JSON.stringify({
          userId: input.userId,
          text: value,
          language,
          ...(input.opportunityId === undefined ? {} : { opportunityId: input.opportunityId }),
          ...(input.analysisId === undefined ? {} : { analysisId: input.analysisId }),
        }),
      });
      if (voice.intent !== "UNSUPPORTED") {
        return {
          reply: voice.reply,
          // When the server returns a list (FILTER_OPPORTUNITIES / SHOW_OPPORTUNITIES),
          // voice.opportunity is undefined but voice.opportunities[0] exists.
          // Pin opportunities[0].id as the working context so the next utterance
          // ("analyze this" / "madaali" / "ለዛህ እድል ምስከረስ") has an opportunityId.
          opportunityId:
            voice.opportunity?.id ??
            voice.analysis?.opportunityId ??
            voice.opportunities?.[0]?.id ??
            input.opportunityId,
          analysisId: voice.analysis?.id ?? input.analysisId,
        };
      }
    } catch {
      // API down: keep the local product-action fallbacks below.
    }
  }

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

  if (/ለዚህ እድል ምስከረስ|should i apply|analyze|analyse|\bfit\b|madaali|madaaluu|apply gochuu|nan apply|አወዳድር|ትንተና/i.test(value)) {
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

  if (/ለምን|why (apply|maybe|skip|did you)|explain|^why\b|maalif|maaliif/i.test(value)) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first. Explanation follows a stored decision." };
    }
    try {
      const explained = await api<{ decision: string; explanation: string }>(
        `/api/analyses/${input.analysisId}/explain`,
        { method: "POST", body: JSON.stringify({ language }) },
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

  if (/ምን ጎድሎኛል|what am i missing|gaps?|missing|maal dhabe|hanqina/i.test(value)) {
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

  if (/personalized readiness|personalize.*(plan|readiness|checklist)|readiness plan/i.test(value)) {
    if (!input.analysisId) {
      return { reply: "Analyze an opportunity first, then ask for a personalized readiness plan." };
    }
    try {
      const plan = await api<{ plan: string; decision: string }>(
        `/api/analyses/${input.analysisId}/readiness/plan`,
        { method: "POST", body: JSON.stringify({ language }) },
      );
      return {
        reply: `${plan.decision}. ${plan.plan}`,
        analysisId: input.analysisId,
        opportunityId: input.opportunityId,
      };
    } catch {
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
  }

  if (/ምን ላዘጋጅ|what should i prepare|readiness|checklist|prepare|qopheessuu|qopheessi/i.test(value)) {
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

  if (
    /extract (my )?profile|build (my )?profile from|profile from (this|my) (text|description)|fill (my )?profile from/i.test(
      value,
    )
  ) {
    const description =
      value.replace(
        /^.*?(?:extract (?:my )?profile(?: from this)?:?|build (?:my )?profile from|profile from (?:this|my) (?:text|description):?|fill (?:my )?profile from)\s*/i,
        "",
      ).trim() || value;
    if (description.length < 8) {
      return {
        reply:
          "Paste a short self-description after the request, or open Profile and use Propose profile fields. Nothing is saved until you confirm.",
      };
    }
    try {
      const result = await api<{
        filledFields: string[];
        notice: string;
        proposed: Record<string, string | number | string[] | null>;
      }>("/api/ai/profile-extract", {
        method: "POST",
        body: JSON.stringify({ text: description }),
      });
      if (result.filledFields.length === 0) {
        return { reply: `I could not extract clear profile facts from that text. ${result.notice}` };
      }
      const parts = result.filledFields.map((field) => {
        const raw = result.proposed[field];
        const shown = Array.isArray(raw) ? raw.join(", ") : String(raw);
        return `${field}: ${shown}`;
      });
      return {
        reply: `Proposed profile facts (not saved yet): ${parts.join("; ")}. Open Profile, confirm into the form, then save. ${result.notice}`,
      };
    } catch {
      return {
        reply:
          "Profile extract is unavailable right now (Groq may be unset). Open Profile and enter facts manually — HULUM never invents stored profile data.",
      };
    }
  }

  if (/update profile|change profile|edit profile/i.test(value)) {
    return { reply: "Open your profile and save the facts there. Voice does not write profile facts." };
  }

  if (typeHit && /show|list|find|filter|internships|scholarships|ኢንተርንሺፕ|ስኮላርሺፕ|ፌሎሺፕ|agarsiisi|natti agarsiisi/i.test(value)) {
    const opportunities = await api<Opportunity[]>("/api/opportunities");
    const filtered = opportunities.filter((item) => item.type === typeHit[1]);
    return { reply: listReply(filtered, language, typeHit[1]), opportunityId: filtered[0]?.id };
  }

  if (/show|list|opportunities|እድሎች|carraawwan|carraa agarsiisi/i.test(value)) {
    const opportunities = await api<Opportunity[]>("/api/opportunities");
    return { reply: listReply(opportunities, language), opportunityId: opportunities[0]?.id };
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
