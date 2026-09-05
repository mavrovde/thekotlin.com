---
description: Full local quality round mirroring CI & Deployment — backend gradle check, frontend lint+test+build, admin test+build
---

Run the project's full verification the way `.github/workflows/deployment.yml` does and
report a concise pass/fail table. Do NOT push anything. On failure fix the root cause
(never weaken a gate) and re-run the affected leg. Consult `lessons-learned` §7 — root
`./gradlew check` alone does NOT cover frontend lint. $ARGUMENTS

## 1. Backend (`cd backend`)
1. `./gradlew check --no-daemon` — JUnit 5 + MockK on H2, jacoco.
2. If the diff touches native SQL or `db/migration/`: also
   `docker compose up -d postgres && ./gradlew bootRun` until Flyway validates and the
   endpoint answers (H2-green ≠ Postgres-valid, lessons-learned §1). Stop bootRun after.

## 2. Frontend (`cd frontend`)
3. `npm run lint`
4. `npm test -- --watchAll=false`
5. `npm run build` (catches server/client-boundary and type errors Jest can't)

## 3. Admin (`cd admin`)
6. `npm test -- --watchAll=false` (admin has NO lint script — do not claim lint passed)
7. `npm run build`

## 4. E2E (when the diff touches user-visible flows, api.ts, or backend contracts)
8. Run `/e2e`.

Output: a table of leg → PASS/FAIL with one line each; end with an explicit "safe to push:
yes/no" and what still blocks.
