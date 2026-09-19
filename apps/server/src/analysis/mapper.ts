import {
  Decision,
  ReadinessStatus,
  RequirementStatus,
  isDecision,
  type Analysis,
  type ReadinessItem,
  type Requirement,
} from "@hulum/shared";
import { NEXT_ACTION } from "../decision/rules.js";

export type AnalysisRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  decision: string;
  fit_score: number;
  summary: string;
  created_at: Date | string;
  updated_at: Date | string;
};

export type RequirementRow = {
  id: string;
  analysis_id: string;
  requirement_key: string;
  requirement_text: string;
  status: string;
  evidence: string | null;
  reason: string | null;
};

export type ReadinessRow = {
  id: string;
  analysis_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIsoDateTime(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

function isRequirementStatus(value: string): value is RequirementStatus {
  return Object.values(RequirementStatus).some((status) => status === value);
}

function isReadinessStatus(value: string): value is ReadinessStatus {
  return Object.values(ReadinessStatus).some((status) => status === value);
}

export function mapRequirementRow(row: RequirementRow): Requirement {
  if (!isRequirementStatus(row.status)) {
    throw new Error("Requirement status in the database is not a locked contract value");
  }
  return {
    id: row.id,
    analysisId: row.analysis_id,
    key: row.requirement_key,
    text: row.requirement_text,
    status: row.status,
    evidence: row.evidence,
    reason: row.reason,
  };
}

export function mapReadinessRow(row: ReadinessRow): ReadinessItem {
  if (!isReadinessStatus(row.status)) {
    throw new Error("Readiness status in the database is not a locked contract value");
  }
  return {
    id: row.id,
    analysisId: row.analysis_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
  };
}

export function nextActionFor(decision: Decision): string {
  if (decision === Decision.APPLY) {
    return NEXT_ACTION.APPLY;
  }
  if (decision === Decision.SKIP) {
    return NEXT_ACTION.SKIP;
  }
  return NEXT_ACTION.MAYBE;
}

export function mapAnalysis(
  row: AnalysisRow,
  requirements: Requirement[],
  readiness: ReadinessItem[],
): Analysis {
  if (!isDecision(row.decision)) {
    throw new Error("Analysis decision in the database is not a locked contract value");
  }
  return {
    id: row.id,
    userId: row.user_id,
    opportunityId: row.opportunity_id,
    decision: row.decision,
    fitScore: row.fit_score,
    summary: row.summary,
    requirements,
    nextAction: nextActionFor(row.decision),
    readiness,
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
  };
}
