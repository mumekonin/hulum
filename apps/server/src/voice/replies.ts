import type { LanguageCode, Opportunity } from "@hulum/shared";

function pick(language: LanguageCode, en: string, am: string, om: string): string {
  if (language === "am") {
    return am;
  }
  if (language === "om") {
    return om;
  }
  return en;
}

function titles(items: Opportunity[]): string {
  return items
    .slice(0, 5)
    .map((item) => `${item.title} — ${item.organization}`)
    .join("; ");
}

export function replyOpportunityList(language: LanguageCode, items: Opportunity[], type?: string): string {
  if (items.length === 0) {
    return pick(
      language,
      "No stored opportunities matched. HULUM does not invent listings.",
      "መታወቅ እድል መዳ᎘ት ያልተገኘም። HULUM እድል አይፈጥርም።",
      "Carraan kuufame hin argamne. HULUM carraa hin uumne.",
    );
  }
  const list = titles(items);
  if (type === "scholarship") {
    return pick(language, `Scholarships: ${list}`, `ስኮላርሺፕ: ${list}`, `Scholarshipwwan: ${list}`);
  }
  if (type === "internship") {
    return pick(language, `Internships: ${list}`, `ኢንተርንሺፕ: ${list}`, `Internshipwwan: ${list}`);
  }
  if (type === "fellowship") {
    return pick(language, `Fellowships: ${list}`, `ፌሎሺፕ: ${list}`, `Fellowshipwwan: ${list}`);
  }
  if (type === "grant") {
    return pick(language, `Grants: ${list}`, `Grants: ${list}`, `Grantii: ${list}`);
  }
  if (type === "job") {
    return pick(language, `Jobs: ${list}`, `Jobs: ${list}`, `Hojiwwan: ${list}`);
  }
  if (type === "competition") {
    return pick(language, `Competitions: ${list}`, `Competitions: ${list}`, `Dorgommiiwwan: ${list}`);
  }
  return pick(
    language,
    `Here are current opportunities: ${list}`,
    `የአሁን እድሎች: ${list}`,
    `Carraawwan amma jiran: ${list}`,
  );
}


export function replyDecisionFilter(language: LanguageCode, decision: string, items: Opportunity[]): string {
  if (items.length === 0) {
    return pick(
      language,
      `No ${decision} opportunities for your profile.`,
      `No ${decision} opportunity for this profile.`,
      `Carraan ${decision} ta'e hin jiru.`,
    );
  }
  const list = titles(items);
  return pick(
    language,
    `${decision} opportunities: ${list}`,
    `${decision} opportunities: ${list}`,
    `Carraawwan ${decision}: ${list}`,
  );
}

export function replyNeedOpportunity(language: LanguageCode): string {
  return pick(
    language,
    "Choose an opportunity first, then ask whether to apply or for the details.",
    "Choose an opportunity first, then ask to apply or for details.",
    "Dursa carraa tokko bani, sana booda apply ykn ibsa gaafadhu.",
  );
}

export function replyNeedAnalysis(language: LanguageCode): string {
  return pick(
    language,
    "Analyze an opportunity first, then I can explain the decision, gaps, or readiness plan.",
    "Analyze the opportunity first, then I can explain the decision, gaps, or readiness.",
    "Dursa carraa madaali, sana booda murtee, hanqina, ykn qophii nan ibsa.",
  );
}

export type SpokenCheck = {
  text: string;
  status: string;
  reason?: string | null;
};

function statusWord(status: string): string {
  if (status === "NOT_MET") return "not met";
  if (status === "UNCERTAIN") return "uncertain";
  if (status === "MET") return "met";
  return status.toLowerCase().replace(/_/g, " ");
}

/** Say how the saved profile lines up with stored requirements. Facts already decided by the engine. */
export function formatSpokenReasons(checks: SpokenCheck[]): string {
  const usable = checks.filter((item) => item.text.trim() !== "");
  const met = usable.filter((item) => item.status === "MET").slice(0, 3);
  const open = usable.filter((item) => item.status === "NOT_MET" || item.status === "UNCERTAIN");
  const chosen = [...met, ...open].slice(0, 6);
  if (chosen.length === 0) {
    return "";
  }
  const lines = chosen.map((item) => {
    const reason = item.reason?.trim().replace(/\.$/, "") ?? "";
    const named = `${item.text.trim()} is ${statusWord(item.status)}`;
    return reason === "" ? named : `${named}. ${reason}`;
  });
  return ` Compared with your saved profile: ${lines.join(". ")}.`;
}

export function replyAnalysis(
  language: LanguageCode,
  title: string,
  decision: string,
  fitScore: number,
  nextAction: string,
  extra?: { summary?: string; gaps?: string[]; sourceUrl?: string; checks?: SpokenCheck[] },
): string {
  const fit = String(fitScore);
  const summary = extra?.summary?.trim() ? ` ${extra.summary.trim()}` : "";
  const because = formatSpokenReasons(extra?.checks ?? []);
  const gapList = (extra?.gaps ?? []).filter((item) => item.trim() !== "");
  const gaps =
    because !== "" || gapList.length === 0
      ? ""
      : pick(
          language,
          ` Missing or uncertain: ${gapList.join("; ")}.`,
          ` Missing or uncertain: ${gapList.join("; ")}.`,
          ` Kan dhabamuu ykn hin mirkanaa'in: ${gapList.join("; ")}.`,
        );
  const source = extra?.sourceUrl
    ? pick(
        language,
        ` Official source: ${extra.sourceUrl}. Confirm eligibility there.`,
        ` Official source: ${extra.sourceUrl}. Confirm eligibility there.`,
        ` Madda: ${extra.sourceUrl}. Ibsa fuula idilee irratti mirkaneessi.`,
      )
    : "";
  return pick(
    language,
    `${decision} for ${title}. Fit ${fit}%.${summary}${because} Next: ${nextAction}.${gaps}${source}`,
    `${decision} for ${title}. Fit ${fit}%.${summary}${because} Next: ${nextAction}.${gaps}${source}`,
    `${title}f murteen ${decision}. Waliin ${fit}%.${summary}${because} Itti aanu: ${nextAction}.${gaps}${source}`,
  );
}

export function replyListThenAnalysis(
  language: LanguageCode,
  items: Opportunity[],
  type: string | undefined,
  title: string,
  decision: string,
  fitScore: number,
  nextAction: string,
  extra?: { summary?: string; gaps?: string[]; sourceUrl?: string; checks?: SpokenCheck[] },
): string {
  return `${replyOpportunityList(language, items, type)} ${replyAnalysis(language, title, decision, fitScore, nextAction, extra)}`;
}

export function replyDetails(language: LanguageCode, item: Opportunity, decision?: string): string {
  const stored =
    decision === undefined
      ? ""
      : pick(
          language,
          ` Stored HULUM decision: ${decision}.`,
          ` Stored HULUM decision: ${decision}.`,
          ` Murteen kuufame: ${decision}.`,
        );
  return pick(
    language,
    `${item.title} — ${item.organization}. Type ${item.type}. Deadline ${item.deadline}. Official source: ${item.sourceUrl}.${stored} Confirm details on the official page.`,
    `${item.title} — ${item.organization}. Type ${item.type}. Deadline ${item.deadline}. Official source: ${item.sourceUrl}.${stored} Confirm on the official page.`,
    `${item.title} — ${item.organization}. Gosa ${item.type}. Guyyaa xumuraa ${item.deadline}. Madda: ${item.sourceUrl}.${stored} Ibsa fuula idilee irratti mirkaneessi.`,
  );
}

export function replyExplain(
  language: LanguageCode,
  decision: string,
  summary: string,
  checks?: SpokenCheck[],
): string {
  const because = formatSpokenReasons(checks ?? []);
  const already = (checks ?? []).filter((item) => {
    const reason = item.reason?.trim().slice(0, 40) ?? "";
    return reason.length > 12 && summary.includes(reason);
  });
  const extra = already.length >= 2 ? "" : because;
  return pick(
    language,
    `${decision}. ${summary}${extra}`,
    `${decision}. ${summary}${extra}`,
    `Murteen ${decision}. ${summary}${extra}`,
  );
}

export function replyGaps(language: LanguageCode, gaps: string[]): string {
  if (gaps.length === 0) {
    return pick(
      language,
      "No missing or uncertain requirements are stored for this analysis.",
      "No missing or uncertain requirements are stored for this analysis.",
      "Hanqinni ykn wanti hin mirkanaa'in hin jiru.",
    );
  }
  const list = gaps.join("; ");
  return pick(
    language,
    `Missing or uncertain: ${list}`,
    `Missing or uncertain: ${list}`,
    `Kan dhabamuu ykn hin mirkanaa'in: ${list}`,
  );
}

export function replyReadiness(language: LanguageCode, nextAction: string, list: string): string {
  return pick(
    language,
    `${nextAction} Prepare: ${list}`,
    `${nextAction} Prepare: ${list}`,
    `${nextAction} Qopheessi: ${list}`,
  );
}

export function replyUnsupported(language: LanguageCode): string {
  return pick(
    language,
    "I can show fellowships, scholarships, internships, grants, jobs, or competitions; analyze a selected opportunity against your profile; explain the decision; show gaps; or give details. Ask in English, Amharic, or Afaan Oromo.",
    "I can show fellowships, scholarships, internships, grants, jobs, or competitions; analyze against your profile; explain the decision; show gaps; or give details. Ask in Amharic, English, or Afaan Oromo.",
    "Fellowship, scholarship, internship, grant, hojii, ykn dorgommii agarsiisuu; carraa madaaluu; murtee ibsuu; hanqina agarsiisuu; ykn ibsa kennuu nan danda'a. Afaan Ingilizii, Amaaraa, ykn Afaan Oromootiin gaafadhu.",
  );
}

export function replyNeedProfile(language: LanguageCode): string {
  return pick(
    language,
    "Create a profile first so HULUM can compare your facts to the opportunity.",
    "Create a profile first so HULUM can compare your facts to the opportunity.",
    "Dursa profile uumi, HULUM dhugaa kee carraa waliin wal bira qaba.",
  );
}

export function replyNeedDecisionWord(language: LanguageCode): string {
  return pick(
    language,
    "Say APPLY, MAYBE, or SKIP when filtering opportunities by decision.",
    "Say APPLY, MAYBE, or SKIP when filtering opportunities by decision.",
    "Carraa murtee irratti qooduuf APPLY, MAYBE, ykn SKIP jedhi.",
  );
}
