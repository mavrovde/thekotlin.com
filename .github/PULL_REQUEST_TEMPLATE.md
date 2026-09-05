## Summary

<!-- What this PR does and why. -->

Closes #

## Acceptance criteria mapping

<!-- For each criterion of the linked issue: how this diff satisfies it. -->

- 

## Verification

<!-- What you actually ran and watched pass — not what you expect to pass. -->

- [ ] Backend: `./gradlew check` (from `backend/`)
- [ ] Frontend: `npm run lint && npm test && npm run build` (if touched)
- [ ] Admin: `npm test && npm run build` (if touched)
- [ ] E2E: `npm run test:e2e` (required for user-visible flow / `api.ts` / backend-contract changes)
- [ ] DTO change? `Dtos.kt` ↔ `api.ts` mirrored in this PR
- [ ] Schema change? New `V<n>__*.sql` migration; no applied migration edited
- [ ] Touches AI participation on the forum? Complies with `.claude/skills/forum-ai-charter/`

## Notes for the reviewer

<!-- Risks, trade-offs, anything you want the pr-reviewer (yes, the agent) to look at hard. -->
