# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TheKotlin.com — a Kotlin knowledge base and community forum. Monorepo with three apps plus an nginx proxy:

- `backend/` — Spring Boot 3.5 REST API (Kotlin 2.4, JDK 26, Gradle 9.7), PostgreSQL 16 + Flyway, JWT auth
- `frontend/` — public Next.js site (App Router, TypeScript), port 3000
- `admin/` — admin Next.js app, port 3001
- `nginx/` — production TLS proxy (port 20443) routing `/` → frontend, `/api/` → backend, `/admin/` → admin

The root Gradle build treats `frontend` and `admin` as subprojects whose `build.gradle.kts` files wrap npm (`npmBuild`, `npmTest`, `npmLint`, `npmDev`), so root `./gradlew build` / `./gradlew check` covers all three apps.

## Commands

### Local development

```bash
docker compose up -d postgres        # Postgres: host port 5434 → container 5432
cd backend && ./gradlew bootRun      # API on :8080 (connects to localhost:5434 by default)
cd frontend && npm install && npm run dev   # :3000
cd admin && npm install && npm run dev      # :3001
```

`python3 manage.py start|stop|restart|build` manages the full docker-compose stack.

### Backend (run from `backend/`)

```bash
./gradlew build                      # compile + tests + jacoco
./gradlew test --tests "com.thekotlin.service.ArticleServiceTest"          # one class
./gradlew test --tests "com.thekotlin.service.ArticleServiceTest.methodName"  # one test
./gradlew check                      # required green before pushing
```

Tests are JUnit 5 + MockK **pure unit tests** — no Spring context, no database. There are no
`@SpringBootTest`/`@DataJpaTest`/`@WebMvcTest` tests and no `src/test/resources/`, so a green
suite proves compilation and service logic only: it does not prove the app boots, that Flyway
migrations apply, or that any SQL is valid. Verify those against real Postgres (see below).
The declared `com.h2database:h2` test dependency is currently unused.

### Frontend / Admin (run from `frontend/` or `admin/`)

```bash
npm run lint                         # frontend only (admin has no lint script)
npm test                             # Jest unit tests
npm test -- path/to/file.test.tsx    # single test file
npm test -- -t "test name"           # by test name
npm run test:coverage
npm run build                        # verify compilation before pushing
npm run test:e2e                     # frontend only: Playwright (starts dev server itself; needs backend on :8080)
```

Playwright e2e specs live in `frontend/e2e/`. `./run_prod_smoke.sh` spins up the prod compose stack and runs `e2e/prod-smoke.spec.ts` against it.

### Release / deployment

Never bump version numbers by hand and never run raw production Docker builds. The only release mechanism is:

```bash
./release.py --patch   # or --minor / --major
```

It bumps `version` in the root `build.gradle.kts`, commits, tags `vX.Y.Z`, and pushes; GitHub Actions (`.github/workflows/deployment.yml`) then runs CI (backend, frontend, admin, e2e) and builds/pushes Docker images to ghcr.io. Tagged ≠ deployed: a green run means images are published — see `.claude/skills/release-flow/`.

## Architecture

### Backend (`backend/src/main/kotlin/com/thekotlin/`)

Standard layering, one file per concern:

- `controller/` → `service/` → `repository/` (Spring Data JPA) → `model/` (JPA entities)
- All REST request/response DTOs are Kotlin data classes in `dto/Dtos.kt`; `service/DtoMapper.kt` converts entities → DTOs. Entities never leave the service layer.
- Auth: `config/JwtUtil.kt` (token create/parse), `config/JwtAuthFilter.kt` (filter chain), `config/SecurityConfig.kt` (route rules, CORS). JWT secret/expiration and CORS origins configured in `application.yml` via env vars (`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `DB_URL`, ...).
- Schema is managed exclusively by Flyway (`src/main/resources/db/migration/V*.sql`); Hibernate is set to `ddl-auto: validate`. New schema changes require a new versioned migration.

### Frontend / Admin

- All backend calls go through a single typed client: `src/lib/api.ts`. It defines TypeScript interfaces mirroring the backend DTOs and attaches the JWT from `localStorage` (guarded with `typeof window !== 'undefined'`). Components never call `fetch` directly.
- Env access is centralized in `src/config/index.ts` (`NEXT_PUBLIC_API_URL`, site URL, GTM/GA/AdSense ids). Never read `process.env` elsewhere.
- `frontend/src/lib/auth.tsx` holds the client-side auth context/provider.
- App Router: server components by default; `'use client'` only where interactivity/hooks are needed. Any `window`/`localStorage`/`document` access must be SSR-guarded.
- SEO pieces live in `frontend/src/app/` (`sitemap.ts`, `robots.ts`, per-route `layout.tsx` metadata).

## Agent team

This repo is staffed by a Claude agent team (Claude is the only AI tooling here — no other
assistant configs). **`agents/PLAYBOOK.md` is the shared working discipline every agent
reads first**; charters in `.claude/agents/` hold role-specific deltas only:

- Delivery: `kotlin-backend-dev`, `nextjs-frontend-dev`, `pipeline-shepherd` (babysits
  "CI & Deployment"), `pr-reviewer` (mandatory merge gate — no PR merges without its
  APPROVE), `release-manager`, `security-triage`, `issue-author`.
- Product (the north star — the most successful Kotlin forum, built on open human↔AI
  communication): `agora-engineer` (human↔AI forum features), `kotlin-content-editor`
  (every published Kotlin snippet must compile), `community-moderator`, `seo-growth`.

Skills: `forum-ai-charter` (product constitution for AI participation — violations are
merge blockers), `lessons-learned` (this repo's known traps — consult before backend SQL,
DTO, migration, release, or dependency work), `release-flow`, `issue-workflow`.
Commands: `/verify`, `/prep-pr`, `/deploy-status`, `/e2e`, `/content-audit`.
Hooks (`.claude/hooks/`, wired in `.claude/settings.json`): `guard-destructive.sh` blocks
irreversible local destruction (volume wipes, dropping the `thekotlin` DB, force-pushes);
`pre-push-gate.sh` runs the CI-mirroring local gates on every `git push` and blocks
hand-edited version bumps (versions move only via `./release.py`).

## Conventions

- TypeScript `any` is banned; mirror backend DTOs with explicit interfaces.
- Kotlin: data classes for all DTOs, constructor injection, no untyped `Map`/`Any` payloads.
- Every code change ships with matching tests (JUnit/MockK, Jest, or Playwright), including error paths (400/500/timeouts).
- Never expose raw stack traces to clients — return sanitized error responses from the backend.
- Verify locally before pushing: `./gradlew check` in `backend/`, plus `npm run lint` / `npm test` / `npm run build` in touched frontend apps.
- Conventional Commits (`feat:`, `fix:`, `chore:`, ...), atomic commits.
- Read dependent files before modifying; fix root causes rather than adding workarounds, and add a regression test for each bug fixed.
