---
name: release-flow
description: >-
  The sanctioned release procedure for TheKotlin.com — ./release.py, the tag-driven
  "CI & Deployment" pipeline, and the tagged≠deployed verification rule. Load when
  preparing, running, or verifying a release, or when asked "is vX.Y.Z out?".
---

# Release flow — TheKotlin.com

**The only release mechanism is `./release.py --patch|--minor|--major`** (repo root).
Never hand-edit `version` in `build.gradle.kts` (the pre-push hook blocks it outside
`chore(release):` commits), never raw docker-build for prod.

## What release.py does (read it — 90 lines)
1. `python3 manage.py stop` — takes down your local compose stack.
2. Bumps `version = "X.Y.Z"` in root `build.gradle.kts`.
3. `git add build.gradle.kts` — only the bumped file. (It used to stage a hardcoded, partly
   stale list; §3 of lessons-learned has the history.) Still run only on an otherwise-clean
   tree — the release commit should contain the bump and nothing else.
4. Commits `chore(release): vX.Y.Z`, tags `vX.Y.Z`, pushes `main` + tags.

`--patch`/`--minor`/`--major` is REQUIRED; with no argument the script prints usage and
exits 1 without touching anything.

## What the tag triggers
`.github/workflows/deployment.yml` on `v*.*.*`: backend/frontend/admin CI → Playwright e2e
(backend health-gated on `/api/stats`) → `Docker — Build *` pushing backend, frontend,
admin, nginx images to ghcr.io.

## Verification ladder (say only what the rung you reached proves)
1. Tag pushed → "release **initiated**".
2. `gh run watch <id> --exit-status` green → "images **published** to ghcr.io".
3. Live-site check (prod host actually pulled the tag) → only now: "**deployed**".

## Preconditions checklist
- [ ] On `main`, pulled, working tree clean.
- [ ] All release PRs merged with pr-reviewer APPROVE.
- [ ] Root `./gradlew check` green + `frontend` `npm run lint` green (lessons-learned §7).
- [ ] SemVer bump chosen BY CONTENT from the merged PRs (major=breaking, minor=new
      user-facing capability, patch=everything else) — one-line justification.
- [ ] security-triage sweep requested for the release notes.
