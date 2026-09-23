-- Decision audit trail from decide(). Additive; older analyses keep null.
alter table analyses
  add column if not exists decision_audit jsonb;

comment on column analyses.decision_audit is
  'Deterministic decide() audit JSON. Fit score remains advisory. Null on analyses created before this migration.';
