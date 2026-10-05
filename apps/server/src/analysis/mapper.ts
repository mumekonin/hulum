import {
  Decision,
  ReadinessStatus,
  RequirementStatus,
  VerificationStatus,
  isDecision,
  type Analysis,
  type DecisionAudit,
  type ReadinessItem,
  type Requirement,
} from "@hulum/shared";
import { nextActionFrom } from "../decision/rules.js";

export type AnalysisRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  decision: string;
  fit_score: number;
  summary: string;
  decision_audit: unknown;
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

export function nextActionFor(
  decision: Decision,
  requirements: Array<Pick<Requirement, "status" | "reason">> = [],
): string {
  return nextActionFrom(
    decision,
    requirements.map((item) => ({
      status: item.status,
      reason: item.reason ?? "",
    })),
  );
}

function isRulePath(value: unknown): value is DecisionAudit["rulePath"] {
  return (
    value === "critical_not_met" ||
    value === "keys_met_no_uncertainty" ||
    value === "default_maybe" ||
    value === "expired_override"
  );
}

function mapDecisionAudit(value: unknown): DecisionAudit | undefined {
  if (value === null || value === undefined || typeof value !== "object") {
    return undefined;
  }
  const record = value as DecisionAudit;
  if (!isRulePath(record.rulePath) || record.fitScoreIsAdvisoryOnly !== true) {
    return undefined;
  }
  if (
    !Object.values(VerificationStatus).some((status) => status === record.effectiveVerificationStatus)
  ) {
    return undefined;
  }
  return record;
}

export function mapAnalysis(
  row: AnalysisRow,
  requirements: Requirement[],
  readiness: ReadinessItem[],
): Analysis {
  if (!isDecision(row.decision)) {
    throw new Error("Analysis decision in the database is not a locked contract value");
  }
  const audit = mapDecisionAudit(row.decision_audit);
  return {
    id: row.id,
    userId: row.user_id,
    opportunityId: row.opportunity_id,
    decision: row.decision,
    fitScore: row.fit_score,
    summary: row.summary,
    requirements,
    nextAction: nextActionFor(row.decision, requirements),
    readiness,
    ...(audit !== undefined ? { audit } : {}),
    createdAt: toIsoDateTime(row.created_at),
    updatedAt: toIsoDateTime(row.updated_at),
  };
}
