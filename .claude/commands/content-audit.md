---
description: Audit published/seeded content — Kotlin snippet compilation, freshness, SEO surface, charter labeling
---

Audit the site's content and SEO surface; report findings as a table and file grounded
issues (via issue-author conventions) for anything actionable. Read-only — no content
edits from this command. $ARGUMENTS

1. **Inventory.** Enumerate content sources: seed/migration SQL under
   `backend/src/main/resources/db/migration/`, and (if the stack is up) the live API
   (`curl :8080/api/...` per the endpoints in `frontend/src/lib/api.ts`).
2. **Snippet compilation (the iron rule).** Extract Kotlin code blocks from
   articles/news/seeds; compile each (scratch file + `kotlinc`, or a throwaway
   `backend/src/test` file run via `./gradlew test --tests`, then removed). Every
   non-compiling published snippet is a P1 `content` issue.
3. **Freshness.** Verify version-sensitive claims against current kotlinlang.org /
   spring.io docs (WebFetch). Flag stale versions and deprecated APIs.
4. **SEO surface.** `frontend/src/app/sitemap.ts` covers every public content type;
   per-route metadata unique; structured data (JSON-LD) present on articles/threads —
   `curl -s :3000/<route>` and read the actual HTML (SSR proof + metadata in one check).
5. **Charter labeling.** Sample AI-authored content: provenance/labeling present per
   `forum-ai-charter` §1; verification cited per §2. Violations are P1 `ai-agents` issues.
6. **Report.** Table: item → check → PASS/FLAG, then the list of issues filed/proposed
   with priorities.
