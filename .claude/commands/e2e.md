---
description: Run the Playwright e2e suite the known-good way — real backend up, health-gated, then test
---

Bring the stack up the way CI does and run the frontend e2e suite. $ARGUMENTS

1. **Backend up:** `docker compose up -d --build backend postgres` (from the repo root).
2. **Health gate (do not skip):** poll `curl -fs http://localhost:8080/api/stats` up to
   ~120s. If it never answers, the failure is a backend startup/migration problem —
   `docker compose logs backend`, diagnose there; do NOT start Playwright against a dead
   backend and report misleading frontend reds.
3. **Run:** `cd frontend && npm run test:e2e` — Playwright's `webServer` starts Next
   itself (dev locally, `npm run start` when `CI=1`, `playwright.config.ts:21`). Pass
   through any extra args: `npm run test:e2e -- <spec-or-grep>`.
4. **On failure:** open `playwright-report/` findings; classify each red as frontend
   assertion vs backend contract before touching code.
5. **Cleanup:** `docker compose stop backend` (plain stop — NEVER `down -v`, that deletes
   the postgres_data volume; the guard hook will block it anyway).

Report: suite verdict, failed specs with one-line causes, and the layer each belongs to.
