---
description: Check the latest "CI & Deployment" run — jobs, verdicts, and what the result actually proves
---

Report the real state of the pipeline; never guess. $ARGUMENTS

1. `git rev-parse HEAD` and `git log --oneline -1` for context.
2. `gh run list --limit 5` — identify the run(s) for the latest push/tag; prefer headSha
   match.
3. For the relevant run: `gh run view <id>` — per-job status for
   `Backend — Build & Test`, `Frontend — Lint, Test & Build`, `Admin — Test & Build`,
   `Frontend — E2E Tests`, `Docker — Build *`.
4. If anything failed: `gh run view <id> --log-failed`, quote the smallest telling snippet,
   name the layer, and recommend the owning agent (kotlin-backend-dev /
   nextjs-frontend-dev / infra-to-user). For e2e reds, check first whether the backend
   ever passed the `/api/stats` health wait (lessons-learned §8).
5. State the verification-ladder rung reached (release-flow skill): initiated / images
   published / deployed-and-verified — and say which. Green Docker jobs mean **published to
   ghcr.io**, not live.
