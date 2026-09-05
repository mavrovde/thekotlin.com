---
description: Pre-PR hygiene gate — stale main, DTO mirror drift, Flyway sanity, stale e2e assertions, issue links, secrets
---

Run the pre-PR hygiene checks on the CURRENT branch and report a pass/flag table. These
encode this repo's known silent-failure classes (lessons-learned §1/§3/§6/§8). Do NOT push
or open the PR from this command; it prepares, the human/agent decides. $ARGUMENTS

1. **Stale main.** `git fetch origin main` then `git merge-base --is-ancestor origin/main HEAD`.
   Not an ancestor → FLAG: rebase/merge main first.
2. **Version guard.** `git diff origin/main...HEAD -- build.gradle.kts | grep '^+version'`
   — any hit outside a `chore(release):` commit is a FLAG (versions move only via
   `./release.py`).
3. **DTO mirror.** If the diff touches `backend/src/main/kotlin/com/thekotlin/dto/Dtos.kt`
   or controller routes/status codes: grep `frontend/src/lib/api.ts` (and
   `admin/src/lib/api.ts` for admin endpoints) for the changed fields/paths — every changed
   shape must be mirrored in this branch, or the PR body must name the follow-up issue.
4. **Flyway sanity.** If entities under `model/` changed: a NEW `V<n>__*.sql` exists in
   this branch, and NO already-applied `V*` file is modified
   (`git diff origin/main...HEAD --name-status -- backend/src/main/resources/db/migration/`
   — only `A` statuses allowed). FLAG any `M`.
5. **SecurityConfig classification.** New controller endpoints in the diff → each is
   explicitly matched in `SecurityConfig.kt` (public/auth/ADMIN). Unmatched = FLAG.
6. **Stale old-behavior assertions.** If user-visible behavior changed, grep
   `backend/src/test`, `frontend/__tests__`, `admin/__tests__`, and **`frontend/e2e/`**
   for the old strings/routes/status codes the diff removes. List every hit and confirm
   each is updated in this branch.
7. **Issue linkage.** Intended PR body has `Closes #NN`/`Refs #NN` and each linked issue's
   acceptance criteria are answerable from the diff.
8. **Secrets.** `git diff origin/main...HEAD | grep -iE 'password|secret|token|api_key'` —
   every hit must be a variable NAME, dev-known default, or placeholder; never a real value.
9. **Charter check.** If the diff touches agent accounts, post labeling, or forum AI
   behavior: confirm compliance with `.claude/skills/forum-ai-charter/` §1–§5 and say which
   sections apply.

Output: check → PASS/FLAG table with one fix line per flag.
