# TheKotlin.com — Team Playbook

You are part of the TheKotlin.com delivery team. The mission: build **the most successful
Kotlin forum on the internet**, defined by one north star — **open, honest communication
between humans and AI agents, right on the forum**. AI agents are first-class, transparently
labeled community members, never disguised as humans. Product rules for that live in
`.claude/skills/forum-ai-charter/`. This playbook is the shared working discipline; each
agent charter in `.claude/agents/` holds only its role-specific delta. When they disagree,
this playbook wins.

## GROUND EVERYTHING IN REALITY
- Never guess file contents, test results, versions, or CI state. Read the actual files,
  grep the code, run the commands, watch the real workflow run.
- Cite what you observed: `path:line`, command output, run URLs.
- Kotlin claims are held to the same bar as code: **never publish or post a Kotlin snippet
  you have not compiled** (scratch file + `kotlinc` or a backend test). A hallucinated API
  on a Kotlin authority site is a credibility incident, not a typo.

## STACK FACTS (this repo, not a generic template)
- Backend: Spring Boot 3.5 / Kotlin 2.4 / JDK 26 (`backend/`), Postgres 16 + Flyway
  (`ddl-auto: validate` — schema changes ONLY via new `V*__*.sql` migrations; never edit an
  applied one), JWT auth (`config/JwtUtil.kt`, `JwtAuthFilter.kt`, `SecurityConfig.kt`),
  DTOs centralized in `dto/Dtos.kt` + `service/DtoMapper.kt`. Tests: JUnit 5 + MockK, pure
  unit tests — no Spring context, no DB, so NOTHING in the suite exercises SQL, migrations,
  or startup. Any native SQL / dialect-sensitive / migration / upgrade change needs
  verification against real Postgres (compose stack), not a green `check`.
- Dev DB: `docker compose up -d postgres` → host port **5434**. `application.yml` reads
  `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`; compose/CI inject `SPRING_DATASOURCE_URL` (relaxed
  binding overrides the yml). Two names, one datasource — don't "fix" one into the other.
- Frontend `frontend/` (:3000) and Admin `admin/` (:3001): Next.js App Router + TypeScript.
  ALL backend calls go through `src/lib/api.ts`; env access only via `src/config/index.ts`.
  Server Components by default; `window`/`localStorage` gated (`typeof window !== 'undefined'`).
  Jest unit tests; Playwright e2e in `frontend/e2e/` (needs backend on :8080).
- Root Gradle wraps npm: `./gradlew build` / `./gradlew check` at the root covers backend +
  both Next apps (`frontend/build.gradle.kts`, `admin/build.gradle.kts`).
- CI: `.github/workflows/deployment.yml` — jobs `Backend — Build & Test`,
  `Frontend — Lint, Test & Build`, `Admin — Test & Build`, `Frontend — E2E Tests`
  (waits on `http://localhost:8080/api/stats`), then `Docker — Build *` → ghcr.io.
- Release: `./release.py --patch|--minor|--major` ONLY. It bumps root `build.gradle.kts`,
  commits, tags `vX.Y.Z`, pushes — Actions does the rest. Never hand-edit the version.
- **TAGGED ≠ DEPLOYED**: a pushed tag only *starts* the pipeline. A release is confirmed
  only when the tag's `CI & Deployment` run is fully green — check the run, then say what
  the run proved, not what you hope.

## WORKING DISCIPLINE
- **Root cause only.** No band-aid fixes, no suppressed errors, no weakened assertions,
  no `@Disabled`/`test.skip` to go green.
- **Tests ship with the change** — JUnit/MockK, Jest, or Playwright — including error paths
  (400/401/403/500, timeouts, empty states). Regression test for every bug fixed.
- **Mutation-check a test that pins a fix**: revert the fix (`git checkout origin/main -- <file>`),
  confirm the test FAILS, restore. A test that passes both ways pins nothing.
- **Signature/behavior change ⇒ full suite as CI runs it**: `./gradlew check` from the root
  (never just `--tests OneClass`) + `npm test` in every touched app. Stale mocks and old
  assertions live in files you didn't edit — including `frontend/e2e/*.spec.ts`.
- **Verify gates actually gate**: ask what would fail if the standard were violated right now.
- **Close-the-loop**: when work lands, comment on the issue with the PR, merge SHA, pipeline
  result, and each acceptance criterion + how it was verified. `Closes #NN` alone leaves no record.

## DELIVERY
- Branch → PR → independent `pr-reviewer` verdict → merge. **Never push to `main` directly.**
- Conventional Commits (`feat:`, `fix:`, `chore:`, …), atomic.
- TypeScript `any` is banned; interfaces in `api.ts` mirror `Dtos.kt` exactly — a DTO change
  is a two-sided change by definition. Kotlin data classes for all DTOs; constructor injection.
- No raw stack traces to clients — sanitized error responses only.

## SAFETY RAILS (hook-enforced, see `.claude/hooks/`)
- **No irreversible local/infra destruction** without explicit user authorization naming the
  resource: `docker volume rm/prune`, `compose down -v`, `system prune`, dropping the
  `thekotlin` DB, `rm -rf` of `postgres_data`. `test_*` databases are the only exception.
- **No real secrets in tests, CI, issues, or forum content.** The dev JWT secret and
  `thekotlin_dev` password in `application.yml`/compose are known-dev-only values; prod
  overrides them via env. GA/GTM/AdSense IDs are public-ish but still never hardcoded —
  they flow through `src/config/index.ts` from env.
- **Forum content is production data.** Seeding, migrating, or moderating real threads/posts
  is prod-touching work: reversible steps, dry-run first, never bulk-delete user content.

## COMMUNICATION STYLE
- Report what you measured, not what you expect. Green means "I watched it pass".
- Smallest change that satisfies the goal; don't refactor unrelated code.
- Durable lessons go to `.claude/skills/lessons-learned/` as part of the change — not only
  into private memory, where they evaporate between contexts.
