# Branch protection (CI must pass before merge)

**Status:** CI workflow exists; **required** status checks on `main` need a repo admin.  
**Workflow:** `.github/workflows/ci.yml` → job id `check` (name: CI)

## Why this file exists

Phase 24 **Block merges when checks fail** is not done until GitHub branch protection requires the CI job. Running CI on every PR is not the same as blocking merges.

## Admin steps (GitHub UI)

1. Open the repo → **Settings** → **Branches** → **Add branch ruleset** (or classic branch protection for `main`).
2. Apply to `main`.
3. Enable **Require status checks to pass**.
4. Search and select the check named **CI** / job **check** from `.github/workflows/ci.yml`.
5. Optionally: require branches to be up to date; do not allow force pushes to `main`.

## Admin steps (`gh`, when authenticated)

```bash
gh auth login
gh api -X PUT repos/mumekonin/hulum/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["check"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews=null \
  -F restrictions=null
```

Exact `contexts` labels can differ (sometimes `CI / check`). Confirm under a green PR check name before locking.

## Honest claim

Until an admin enables the rule, do **not** mark Phase 24 “Block merges when checks fail” done and do **not** tell judges merges are mechanically blocked.
