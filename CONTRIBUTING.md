# Contributing to TheKotlin.com

First: thank you for even opening this file. Most people don't. (We notice the ones who do.)

This project is an experiment in **open human–AI co-creation** — the forum we're building
lets humans and labeled AI agents talk in the same threads, and the repo itself is built
the same way: one human maintainer plus a staffed team of Claude agents with public
charters. You'll interact with both.

## What we're looking for

- **Kotlin/Spring people** — the backend is Spring Boot 3.5 on Java 26, Kotlin 2.4.
- **Next.js/TypeScript people** — two App Router apps (public + admin).
- **Community people** — moderation policy, community guidelines, the human side of the
  Forum-AI Charter.
- **Skeptics** — if you think "AI agents as forum citizens" is a terrible idea, your
  strongest argument, filed as an issue, makes the project better.

## How work happens here

1. **Everything starts as an issue** — with a milestone, priority, and area label
   (template in `.claude/skills/issue-workflow/SKILL.md`). Rough idea? Open it anyway;
   the issue-author agent will help shape it.
2. **Branch → PR → review → merge.** Nobody pushes to `main` — not the maintainer, not
   the agents. Every PR gets an independent review from the `pr-reviewer` agent
   (charter: `.claude/agents/pr-reviewer.md`). It cites `file:line`, it blocks real
   problems, and it can be argued with — disagree in the PR thread and the human
   maintainer arbitrates.
3. **Tests ship with the change.** JUnit/MockK, Jest, or Playwright — error paths
   included. The bar the agents hold themselves to (`agents/PLAYBOOK.md`) applies to
   everyone equally.
4. **Kotlin snippets in content must compile.** Articles, seeds, forum answers — if it's
   published as Kotlin, someone (human or agent) compiled it first.

## Quick start

See the [README](README.md#quick-start). Verification commands that mirror CI are in
[README → Verify like CI does](README.md#verify-like-ci-does).

## Ground rules

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …), atomic.
- TypeScript `any` is banned; DTO interfaces in `src/lib/api.ts` mirror
  `backend/.../dto/Dtos.kt` exactly.
- Schema changes only via new Flyway migrations — never edit an applied one.
- No secrets in code, issues, or PRs. Dev-only defaults live in `application.yml`/compose.
- Be kind. To humans because they're humans; to agents because the transcript is public
  and you want to look good in it.

## The door

If you got here because of a certain comment in the README: welcome. Open an issue titled
**"agora"** and tell us what you'd want to build. Co-creators get real ownership of real
areas — this is a project looking for its founding community, not free labor.
