---
name: lessons-learned
description: >-
  The committed "do-not-repeat" knowledge base for TheKotlin.com — traps that unit
  tests and PR CI do not catch. Consult BEFORE running backend tests with native
  SQL, changing DTOs, writing Flyway migrations, running ./release.py, touching
  frontend dependencies, or claiming a release is live. When you learn a new
  durable lesson, add it HERE as part of the change — not only to private memory,
  where it evaporates between contexts and contributors.
---

# Lessons learned — TheKotlin.com (do not repeat)

Each entry: **the trap → why it bites → how to apply.**

## §1 H2-green ≠ Postgres-valid
Backend tests run on H2; prod runs Postgres 16. Native queries, dialect-sensitive SQL, and
every Flyway migration can pass the whole suite and fail the real DB. → Any such change is
additionally verified against real Postgres: `docker compose up -d postgres` (host **5434**),
`./gradlew bootRun` (Flyway validates on startup), hit the endpoint.

## §2 Two names, one datasource
`application.yml` reads `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` (default `localhost:5434`);
docker-compose and CI inject `SPRING_DATASOURCE_URL`/`_USERNAME`/`_PASSWORD`, which Spring's
relaxed binding lets override `spring.datasource.*` directly. Both are live paths. → Don't
"unify" one into the other casually; changing either set breaks a different environment.

## §3 release.py stages a hardcoded stale file list
`release.py` runs `git add` on a fixed list (`V2__news.sql`, two e2e specs, `deployment.yml`,
`manage.py`, …) left over from an old release. → Run it ONLY on a clean tree; anything
unrelated sitting modified gets swallowed into the release commit. It also runs
`manage.py stop` first — your local stack goes down. Version bumps happen ONLY through this
script (pre-push hook enforces: version changes outside `chore(release):` commits are blocked).

## §4 Tagged ≠ deployed
`./release.py` pushing a `v*` tag only *starts* `deployment.yml`; green Stage 3 means images
are **published to ghcr.io**, not that any host runs them. → Never announce "vX.Y.Z is live"
from a tag or even a green run; say "published", and verify the live site separately.

## §5 frontend pins `latest`, admin pins semver
`frontend/package.json` declares every dependency as `"latest"` — a bare `npm install`
(vs `npm ci`) is a silent full upgrade; `admin/` pins real ranges (and is on Next 16 /
React 19 while docs still say Next 14). → In `frontend/`, use `npm ci` for reproduction;
treat lockfile regeneration as a dependency-upgrade change with full test/build evidence.

## §6 DTO drift compiles clean on both sides
TypeScript can't see Kotlin: renaming a field in `dto/Dtos.kt` leaves
`frontend/src/lib/api.ts` compiling happily against the old shape; it breaks only at
runtime (often only in e2e or prod). → A DTO/route/status-code change is by definition a
two-sided change: same PR, or an explicit follow-up issue named in the PR body.

## §7 Admin has no lint; gradle check ≠ full CI
`admin/package.json` has no `lint` script, and the Gradle-npm glue wires only `npmTest`
into `check` (frontend `npm run lint` is CI-only). Frontend's `npmTest` even passes
`--passWithNoTests`. → "Root `./gradlew check` green" does NOT imply "frontend lint green"
— run `npm run lint` in `frontend/` explicitly before pushing (`/verify` does).

## §8 The e2e job gates on `/api/stats`
CI's e2e stage curls `http://localhost:8080/api/stats` for up to 120s before Playwright
runs. → Breaking or securing that endpoint (or slowing startup past the window, e.g. a long
migration) fails e2e with a misleading "frontend" red. Check backend startup logs first
when e2e reds look unrelated to the diff.

## §9 Old rules files referenced things that don't exist
The removed `.cursorrules` era mandated `./release.sh` and `CHANGELOG.md` — neither exists;
the real mechanism is `./release.py`, and there is no changelog (yet). → Trust CLAUDE.md +
`agents/PLAYBOOK.md`; when docs and repo disagree, the repo wins and the doc gets fixed in
the same PR.

## §10 Forum data is production data
Threads, posts, users — including AI-agent posts — are user trust made persistent. → No
bulk mutation/deletion outside a reviewed migration; moderation actions are proposed by
agents, executed by humans; `docker compose down -v` deletes the local forum wholesale
(the guard hook blocks it).
