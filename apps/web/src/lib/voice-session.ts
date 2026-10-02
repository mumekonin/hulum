import type { TextActionResult } from "./text-actions";

export const HULUM_VOICE_REPLY_EVENT = "hulum-voice-reply";

const OPPORTUNITY_KEY = "hulum.voice.opportunityId";
const ANALYSIS_KEY = "hulum.voice.analysisId";

export type VoiceSessionIds = {
  opportunityId?: string;
  analysisId?: string;
};

export function readVoiceSession(): VoiceSessionIds {
  if (typeof window === "undefined") {
    return {};
  }
  const opportunityId = window.sessionStorage.getItem(OPPORTUNITY_KEY) ?? undefined;
  const analysisId = window.sessionStorage.getItem(ANALYSIS_KEY) ?? undefined;
  return {
    ...(opportunityId === undefined ? {} : { opportunityId }),
    ...(analysisId === undefined ? {} : { analysisId }),
  };
}

export function writeVoiceSession(next: VoiceSessionIds): void {
  if (typeof window === "undefined") {
    return;
  }
  if (next.opportunityId) {
    window.sessionStorage.setItem(OPPORTUNITY_KEY, next.opportunityId);
  }
  if (next.analysisId) {
    window.sessionStorage.setItem(ANALYSIS_KEY, next.analysisId);
  }
}

export function clearVoiceSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(OPPORTUNITY_KEY);
  window.sessionStorage.removeItem(ANALYSIS_KEY);
}

export type VoiceReplyDetail = {
  userText: string;
  reply: string;
  result?: TextActionResult;
};

export function publishVoiceReply(
  userText: string,
  reply: string,
  result?: TextActionResult,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const detail: VoiceReplyDetail = { userText, reply, ...(result ? { result } : {}) };
  window.dispatchEvent(new CustomEvent(HULUM_VOICE_REPLY_EVENT, { detail }));
}

export const HULUM_VOICE_ROUTES: Array<{ path: string; description: string }> = [
  { path: "/journey", description: "The HULUM journey after login" },
  { path: "/opportunities", description: "Browse stored opportunities" },
  { path: "/my-opportunities", description: "Saved opportunities and past APPLY/MAYBE/SKIP decisions" },
  { path: "/readiness", description: "Preparation progress for analyzed opportunities" },
  { path: "/profile", description: "View and edit the signed-in profile" },
  { path: "/assistant", description: "Ask HULUM with text and quick actions" },
  { path: "/screenshot", description: "Analyze an opportunity screenshot" },
  { path: "/research", description: "ScholarXIV research papers, not scholarship listings" },
];
