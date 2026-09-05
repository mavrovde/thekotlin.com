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

## §1 The backend suite never touches a database at all
Stronger than the old "H2 ≠ Postgres" framing, and verified: there are **zero**
`@SpringBootTest`/`@DataJpaTest`/`@WebMvcTest`/`@ActiveProfiles` tests and no
`backend/src/test/resources/`. Every backend test is a pure JUnit 5 + MockK unit test with
mocked repositories; the declared `com.h2database:h2` dependency is unused. So a green
`./gradlew check` proves compilation and service logic — never that the app boots, that
Flyway migrations apply, or that any SQL parses. Native queries, dialect-sensitive SQL,
migrations, and Spring/Hibernate/Flyway version bumps all pass the suite and fail the real
DB. → Verify such changes against real Postgres: `docker compose up -d postgres`
(host **5434**), `./gradlew bootRun` (Flyway + `ddl-auto: validate` run on startup), hit
the endpoint. In CI, the e2e job is the only stage that actually boots the backend.

## §2 Two names, one datasource
`application.yml` reads `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` (default `localhost:5434`);
docker-compose and CI inject `SPRING_DATASOURCE_URL`/`_USERNAME`/`_PASSWORD`, which Spring's
relaxed binding lets override `spring.datasource.*` directly. Both are live paths. → Don't
"unify" one into the other casually; changing either set breaks a different environment.

## §3 release.py stages, stops your stack, and owns the version
It used to `git add` a hardcoded stale file list (`V2__news.sql`, two e2e specs,
`deployment.yml`, `manage.py`, …) left over from an old release, silently swallowing
unrelated edits to those paths; it now stages only `build.gradle.kts`. → Still run it ONLY
on a clean tree — the commit is meant to contain the bump and nothing else. It also runs
`manage.py stop` first, so your local stack goes down. Version bumps happen ONLY through
this script; the pre-push hook blocks a version change outside a `chore(release):` commit
(its anchor must tolerate the leading indent — `version` sits inside `allprojects { }`).

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

## §11 `set -o pipefail` + `grep -q` silently inverts hook conditions
In the `.claude/hooks/` scripts (all `set -uo pipefail`), `producer | grep -q PATTERN` is a
trap: `grep -q` exits the moment it matches, the producer dies of SIGPIPE (141), and
`pipefail` promotes 141 to the *pipeline's* status — so a successful match reports failure.

**The rule is unconditional: never put `grep -q` downstream of anything under `pipefail`.**
There is no safe size. Measured on this repo's pattern, the threshold depends on what kind
of producer it is, and for a forked one it is tiny:

| producer                        | inverts from            |
|---------------------------------|-------------------------|
| `git log --format='%s'` (forked)| ~13 commits / ~585 bytes|
| `printf '%s\n' "$var"` (builtin)| only past 64KB          |

A forked producer is still mid-run when `grep -q` closes the pipe, so size barely matters;
a shell builtin writes one blob and only fails past the pipe buffer. This is a *race*, so
results vary by machine and run — a case that passes proves nothing.

Neither `|| true` inside the pipeline (pipefail takes the rightmost non-zero) nor capturing
into a variable and re-piping with `printf ... | grep -q` fixes it. → Match with bash's own
`[[ $s =~ $re ]]` — no subprocess, no pipe, nothing to signal. Prepend a newline to the
subject string and anchor the regex on `\n` so per-line `^` semantics still work.

Verified: at 204KB of log, the old shape AND the capture-then-pipe shape both DENY a
legitimate `chore(release):` push; the `=~` shape allows it. Regression test:
`.claude/hooks/tests/version-guard-matrix.sh` (9 cases; it catches both broken shapes).
When testing a hook condition, include both a small forked-producer case and a >64KB one.
