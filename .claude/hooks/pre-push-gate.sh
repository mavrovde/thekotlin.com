#!/usr/bin/env bash
# Pre-push gate for TheKotlin.com.
#
# PreToolUse `Bash` hook: for `git push` commands only, runs the local quality
# round that mirrors `.github/workflows/deployment.yml` and BLOCKS the push if
# anything fails — CI minutes are expensive and a red main blocks the whole team.
# For any non-push command it allows instantly.
#
# Legs (each toggleable via env, e.g. in .claude/settings.local.json "env"):
#   PREPUSH_RUN_BACKEND=1    backend ./gradlew check   (JUnit+MockK on H2, jacoco)
#   PREPUSH_RUN_FRONTEND=1   frontend npm run lint + npm test
#   PREPUSH_RUN_ADMIN=1      admin npm test            (admin has no lint script)
#   PREPUSH_GUARD_VERSION=1  refuse to push a hand-edited version in build.gradle.kts
#                            (version bumps belong to ./release.py — its commits are
#                            exempt via the chore(release): subject)
#   PREPUSH_LOG              combined log location
set -uo pipefail

: "${PREPUSH_RUN_BACKEND:=1}"
: "${PREPUSH_RUN_FRONTEND:=1}"
: "${PREPUSH_RUN_ADMIN:=1}"
: "${PREPUSH_GUARD_VERSION:=1}"
: "${PREPUSH_LOG:=/tmp/thekotlin-prepush.log}"

allow() {
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}
deny() {
  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"$1\"}}"
  exit 0
}

INPUT="$(cat)"
CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# Self-gate: only actual `git push` invocations pay the toll.
printf '%s' "$CMD" | grep -qE '(^|[;&|][[:space:]]*)git([[:space:]]+-[^ ]+)*[[:space:]]+push' || allow

ROOT="${CLAUDE_PROJECT_DIR:-.}"
: > "$PREPUSH_LOG"

fail_leg() {
  deny "Pre-push gate FAILED at: $1. Fix the root cause (never weaken the gate) — full log: $PREPUSH_LOG"
}

# --- Version guard: version changes must come from release.py, not by hand ----
if [ "$PREPUSH_GUARD_VERSION" = "1" ]; then
  if git -C "$ROOT" diff --cached origin/main...HEAD -- build.gradle.kts 2>/dev/null | grep -qE '^\+version' || \
     git -C "$ROOT" log origin/main..HEAD --format='%s' -- build.gradle.kts 2>/dev/null | grep -q . ; then
    # Only block when a version line changed outside a release commit.
    if git -C "$ROOT" diff origin/main...HEAD -- build.gradle.kts 2>/dev/null | grep -qE '^\+version[[:space:]]*=' && \
       ! git -C "$ROOT" log origin/main..HEAD --format='%s' 2>/dev/null | grep -qE '^chore\(release\):'; then
      fail_leg "version guard — build.gradle.kts version changed outside a chore(release) commit; use ./release.py"
    fi
  fi
fi

# --- Backend: mirrors CI "Backend — Build & Test" -----------------------------
if [ "$PREPUSH_RUN_BACKEND" = "1" ]; then
  echo "== backend ./gradlew check ==" >> "$PREPUSH_LOG"
  ( cd "$ROOT/backend" && ./gradlew check --no-daemon ) >> "$PREPUSH_LOG" 2>&1 || fail_leg "backend ./gradlew check"
fi

# --- Frontend: mirrors CI "Frontend — Lint, Test & Build" (build left to CI) --
if [ "$PREPUSH_RUN_FRONTEND" = "1" ]; then
  echo "== frontend lint + test ==" >> "$PREPUSH_LOG"
  ( cd "$ROOT/frontend" && npm run lint && npm test -- --watchAll=false ) >> "$PREPUSH_LOG" 2>&1 || fail_leg "frontend lint/test"
fi

# --- Admin: mirrors CI "Admin — Test & Build" ---------------------------------
if [ "$PREPUSH_RUN_ADMIN" = "1" ]; then
  echo "== admin test ==" >> "$PREPUSH_LOG"
  ( cd "$ROOT/admin" && npm test -- --watchAll=false ) >> "$PREPUSH_LOG" 2>&1 || fail_leg "admin test"
fi

allow
