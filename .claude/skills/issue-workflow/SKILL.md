---
name: issue-workflow
description: >-
  Issue-driven development for TheKotlin.com — the 8-section issue template, the
  milestone/label taxonomy (including forum-specific areas like ai-agents and
  content), and the close-the-loop rule. Load when creating or triaging issues,
  wiring Closes #NN into a PR, or closing out landed work.
---

# Issue workflow — TheKotlin.com

Issues are the project notebook: every idea, bug, content plan, agent-charter change, and
research decision lives as an issue — not in chat or private memory.

## Invariant — no orphan issues
Every issue has: **a milestone + exactly one priority label + ≥1 area label + a type label.**

- **Milestones:** *Forum core* · *Human–AI communication* · *Content & knowledge base* ·
  *SEO & growth* · *Security & hardening* · *Reliability & bug fixes* · *CI/CD, tooling & docs*
- **Priority:** `P0-critical` `P1-high` `P2-medium` `P3-low`
- **Area:** `backend` `frontend` `admin` `infra` `ci-cd` `forum` `content` `ai-agents` `seo` `security`
- **Type:** `bug` `enhancement` `documentation` `dependencies` `security`

Verify names exist before use (`gh label list`, `gh api .../milestones --jq '.[].title'`);
bootstrap missing ones (`gh label create`, `gh api -X POST .../milestones`) rather than
inventing per-issue variants.

## Template (all 8 sections, in order)
Summary · Why it matters (tie to the north star) · Impact · Current state (grounded,
`path:line` you actually read) · Proposed action (numbered) · Acceptance criteria
(`- [ ]`, objectively checkable) · How to verify (commands + expected output) · Links.

## PRs
`Closes #NN`/`Refs #NN` for every addressed issue; the body maps each acceptance criterion
to how the diff satisfies it. Type + area labels on the PR mirror the issue's.

## Close-the-loop (mandatory)
After merge: comment on the issue with the PR link, merge SHA, the `CI & Deployment` run
result, and each acceptance criterion with who verified it and what they ran. A bare
auto-close leaves no record — the comment IS the record.

## Safety
Public-facing project: no secrets, JWT values, or working exploits in issues — config
locations and vulnerability classes only.
