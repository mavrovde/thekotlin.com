#!/usr/bin/env bash
# Regression test for the pre-push version guard in ../pre-push-gate.sh.
#
# Run:  bash .claude/hooks/tests/version-guard-matrix.sh
# Exits non-zero if any case misbehaves.
#
# WHY THIS EXISTS: the guard has shipped broken twice.
#   1. The added-line anchor was `^\+version`, but `version` is indented inside
#      `allprojects { }`, so it never matched and hand bumps pushed clean.
#   2. `git ... | grep -q` under `set -o pipefail`: grep -q exits on first match, the
#      producer dies of SIGPIPE (141), pipefail promotes 141 to the pipeline status and
#      inverts the condition. It only manifests past the 64KB pipe buffer, so shallow
#      test repos pass while real branches fail. CASE H/I exist to catch exactly that —
#      do not "simplify" them away, and never trust a 1-commit-deep test here.
set -euo pipefail

SP="$(mktemp -d)"
SRC="$(cd "$(dirname "$0")/../../.." && pwd)"
HOOK_SRC="$SRC/.claude/hooks/pre-push-gate.sh"
FAILURES=0

cleanup() { cd /; rm -rf "$SP"; }
trap cleanup EXIT

gc() { git -c user.email=t@t -c user.name=t commit -q "$@"; }

fresh_clone() {
  cd /
  rm -rf "$SP/repo"
  git clone -q --no-hardlinks "$SRC" "$SP/repo" 2>/dev/null
  cd "$SP/repo"
  git remote remove origin; git remote add origin "$SRC"
  git fetch -q origin main:refs/remotes/origin/main
  git checkout -q -B t origin/main
  mkdir -p .claude/hooks
  cp "$HOOK_SRC" .claude/hooks/pre-push-gate.sh
}

run_hook() {
  echo '{"tool_input":{"command":"git push"}}' \
    | CLAUDE_PROJECT_DIR="$PWD" PREPUSH_RUN_BACKEND=0 PREPUSH_RUN_FRONTEND=0 \
      PREPUSH_RUN_ADMIN=0 bash .claude/hooks/pre-push-gate.sh \
    | sed -n 's/.*"permissionDecision":"\([a-z]*\)".*/\1/p'
}

# Rewrite whatever X.Y.Z currently sits in build.gradle.kts — never hardcode a version,
# the release bumps it.
bump() {
  python3 - "$1" <<'PY'
import re, sys
p = "build.gradle.kts"
s = open(p).read()
s = re.sub(r'(version\s*=\s*")\d+\.\d+\.\d+(")', r'\g<1>' + sys.argv[1] + r'\g<2>', s)
open(p, "w").write(s)
PY
}

check() { # label expected actual extra
  local label="$1" expected="$2" actual="$3" extra="${4:-}"
  if [ "$actual" = "$expected" ]; then
    printf '  PASS  %-46s %-5s %s\n' "$label" "$actual" "$extra"
  else
    printf '  FAIL  %-46s got=%s want=%s %s\n' "$label" "$actual" "$expected" "$extra"
    FAILURES=$((FAILURES + 1))
  fi
}

# 200 commits with ~1KB subjects => git log output far exceeds the 64KB pipe buffer.
many_fat_commits() {
  local pad; pad=$(printf 'x%.0s' $(seq 1 1000))
  local i; for i in $(seq 1 200); do git commit -q --allow-empty -m "chore: ordinary $i $pad"; done
}

echo "=============== pre-push version guard: acceptance matrix ==============="

fresh_clone
for i in 1 2 3; do echo "x$i" > "f$i.txt"; git add "f$i.txt"; gc -m "chore: ordinary $i"; done
bump 9.9.9; git add build.gradle.kts; gc -m "chore(release): v9.9.9"
check "C  release commit NEWEST, depth 4" allow "$(run_hook)"

fresh_clone
bump 9.9.9; git add build.gradle.kts; gc -m "chore(release): v9.9.9"
for i in 1 2 3; do echo "x$i" > "f$i.txt"; git add "f$i.txt"; gc -m "chore: ordinary $i"; done
check "C2 release commit OLDEST, depth 4" allow "$(run_hook)"

fresh_clone
bump 9.9.9; git add build.gradle.kts; gc -m "chore(release): v9.9.9"
check "C3 release commit alone, depth 1" allow "$(run_hook)"

fresh_clone
bump 9.9.9; git add build.gradle.kts; gc -m "chore: sneaky hand bump"
for i in 1 2 3; do echo "x$i" > "f$i.txt"; git add "f$i.txt"; gc -m "chore: ordinary $i"; done
check "D  hand bump buried, depth 4" deny "$(run_hook)"

fresh_clone
bump 9.9.9; git add build.gradle.kts; gc -m "chore: sneaky hand bump"
check "E  hand bump alone, depth 1" deny "$(run_hook)"

fresh_clone
for i in $(seq 1 12); do echo "x$i" > "f$i.txt"; git add "f$i.txt"; gc -m "chore: ordinary $i"; done
check "F  no version change at all" allow "$(run_hook)"

# Guards the fail-OPEN direction: version line hoisted to the top of a large diff.
fresh_clone
python3 - <<'PY'
s = open("build.gradle.kts").read()
lines = [l for l in s.splitlines(True) if "version = " not in l]
open("build.gradle.kts", "w").write('version = "9.9.9"\n' + "".join(lines) + "\n// pad\n" * 800)
PY
git add build.gradle.kts; gc -m "chore: hand bump, version line first, huge diff"
check "G  version line first in a huge diff" deny "$(run_hook)"

# CASE H/I: the SIGPIPE cases. Both previously DENIED a legitimate release push.
fresh_clone
many_fat_commits
bump 9.9.9; git add build.gradle.kts; gc -m "chore(release): v9.9.9"
check "H  release commit, log >64KB" allow "$(run_hook)" \
  "(log=$(git log origin/main..HEAD --format='%s' | wc -c | tr -d ' ')B)"

fresh_clone
many_fat_commits
bump 9.9.9; git add build.gradle.kts; gc -m "chore: sneaky hand bump"
check "I  hand bump, log >64KB" deny "$(run_hook)" \
  "(log=$(git log origin/main..HEAD --format='%s' | wc -c | tr -d ' ')B)"

echo "========================================================================="
if [ "$FAILURES" -ne 0 ]; then
  echo "RESULT: $FAILURES case(s) FAILED"
  exit 1
fi
echo "RESULT: all cases passed"
