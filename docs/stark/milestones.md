# Milestone tags (Phase 27 P1)

**Rule:** tags mark real commits that already existed. They do not invent a production release, EthioDeploy URL, or live mic claim.

List tags: `git tag -l 'milestone/*'`

| Tag | Commit | Marks |
|---|---|---|
| `milestone/foundation-web-api` | `f69928d` | First Next.js web app, Express API scaffold, and shared decision contracts |
| `milestone/vertical-slice` | `aafc203` | Profile → opportunity → analyze covered through the real API |
| `milestone/ci-build-gates` | `a7422d9` | GitHub Actions builds web and server (`#40`) |
| `milestone/postgres-ask-hulum` | `36987c2` | Postgres Ask HULUM voice routes + optional Voxide widget path |
| `milestone/v0.1-local` | tip that added this file | Local-only v0.1 stack documented and tagged — **not deployed** |

## What these are not

- Not SemVer product releases (`v0.8.0` / `v1.0.0` were never cut; do not invent them).
- Not proof of production voice, Amharic STT, or a public host.
- Not a rewrite of Git history — annotated tags only.

## Verify

```bash
git fetch --tags
git show milestone/vertical-slice
git log --oneline milestone/foundation-web-api..milestone/v0.1-local
```
