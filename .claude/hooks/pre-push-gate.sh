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
# Two traps live here, both previously shipped broken:
#   1. `version` sits indented inside `allprojects { }`, so the added-line anchor must
#      tolerate leading whitespace — `^\+version` never matches `+    version = "..."`.
#   2. NEVER feed these strings into `grep -q` through a PIPE. `grep -q` exits on first
#      match; whatever is upstream then dies of SIGPIPE (141) and `set -o pipefail` promotes
#      that 141 to the pipeline's status, inverting the condition. This bites once the
#      upstream output exceeds the 64KB pipe buffer (~200 commits), so it hides in small
#      test repos and appears on real branches. Capturing into a variable is NOT sufficient
#      either — `printf ... | grep -q` takes the same SIGPIPE. Match with bash's own `=~`
#      instead: no subprocess, no pipe, nothing to signal.
#      Both strings get a leading newline so `\n` anchors every line, including the first.
if [ "$PREPUSH_GUARD_VERSION" = "1" ]; then
  VERSION_DIFF="$(git -C "$ROOT" diff origin/main...HEAD -- build.gradle.kts 2>/dev/null || true)"
  BRANCH_SUBJECTS="$(git -C "$ROOT" log origin/main..HEAD --format='%s' 2>/dev/null || true)"
  NL=$'\n'
  RE_VERSION_ADDED="${NL}\+[[:space:]]*version[[:space:]]*="
  RE_RELEASE_COMMIT="${NL}chore\(release\):"
  if [[ "${NL}${VERSION_DIFF}" =~ $RE_VERSION_ADDED ]] && \
     ! [[ "${NL}${BRANCH_SUBJECTS}" =~ $RE_RELEASE_COMMIT ]]; then
    fail_leg "version guard — build.gradle.kts version changed outside a chore(release) commit; use ./release.py"
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
