#!/usr/bin/env bash
# Guardrail against irreversible local/infra destruction for TheKotlin.com.
#
# PreToolUse `Bash` hook: inspects the command JSON on stdin and DENIES a small,
# high-blast-radius set of commands that would wipe stateful local resources the
# user never explicitly authorized destroying:
#   - Docker volume destruction (postgres_data holds the forum's dev database)
#   - `docker compose down -v/--volumes`, `docker system prune`, `docker image prune -a`
#   - Dropping the `thekotlin` database (only `test_*` DBs may be dropped autonomously)
#   - Recursive rm of data directories / the ssl dir
#   - Force-pushing or deleting refs on origin main / release tags
#
# Command-position aware (lite): it splits the command on shell separators and
# matches only when a destructive command is actually invoked — a `git commit -m`
# message or a `grep` for these patterns is never blocked.
#
# Bypass for an explicitly authorized action: GUARD_DESTRUCTIVE=0 <command>
# (or export GUARD_DESTRUCTIVE=0 for the session). A backup is not consent.
set -uo pipefail
export LC_ALL=C

allow() {
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}
deny() {
  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"$1\"}}"
  exit 0
}

: "${GUARD_DESTRUCTIVE:=1}"
[ "$GUARD_DESTRUCTIVE" = "1" ] || allow

INPUT="$(cat)"
CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -z "$CMD" ] && CMD="$INPUT"

# Refuse-to-analyse must never mean allow: oversized commands are denied.
if [ "${#CMD}" -gt 24000 ]; then
  deny "Command exceeds the guard's 24000-byte analysis bound. Split it into smaller commands."
fi

# Split into command segments on ; | && || and newlines.
SEGMENTS="$(printf '%s' "$CMD" | sed -e 's/&&/\n/g' -e 's/||/\n/g' -e 's/;/\n/g' -e 's/|/\n/g')"

# Tools whose arguments are text, not invocations — segments led by these are skipped.
TEXT_TOOLS='^(git|grep|rg|echo|printf|cat|head|tail|sed|awk|less|man|gh)$'

while IFS= read -r seg; do
  # Trim leading whitespace and leading env assignments (VAR=val cmd ...).
  seg="$(printf '%s' "$seg" | sed -e 's/^[[:space:]]*//')"
  [ -z "$seg" ] && continue

  # A leading GUARD_DESTRUCTIVE=0 on THIS segment disarms the guard for it.
  case "$seg" in GUARD_DESTRUCTIVE=0\ *) continue ;; esac

  stripped="$seg"
  while printf '%s' "$stripped" | grep -qE '^[A-Za-z_][A-Za-z0-9_]*=[^ ]* '; do
    stripped="$(printf '%s' "$stripped" | sed -E 's/^[A-Za-z_][A-Za-z0-9_]*=[^ ]* //')"
  done
  # Unwrap common indirection so `sudo docker ...` / `xargs docker ...` are still seen.
  stripped="$(printf '%s' "$stripped" | sed -E 's/^(sudo|env|nohup|time|xargs)( -[^ ]+)* //')"

  first="$(printf '%s' "$stripped" | awk '{print $1}')"
  base="${first##*/}"

  # git is text-safe EXCEPT push (handled below); other text tools are fully skipped.
  if printf '%s' "$base" | grep -qE "$TEXT_TOOLS"; then
    if [ "$base" = "git" ] && printf '%s' "$stripped" | grep -qE '^git([[:space:]]+-[^ ]+)*[[:space:]]+push'; then
      if printf '%s' "$stripped" | grep -qE -- '(--force|--force-with-lease|[[:space:]]\+[^ ]+|--delete[[:space:]]|[[:space:]]:refs/|[[:space:]]:v?[0-9])'; then
        deny "Force-push / ref deletion against the remote is blocked (release tags and main are append-only). If explicitly authorized, prefix with GUARD_DESTRUCTIVE=0."
      fi
    fi
    continue
  fi

  case "$base" in
    docker|docker-compose)
      if printf '%s' "$stripped" | grep -qE 'volume[[:space:]]+(rm|prune)'; then
        deny "docker volume rm/prune would destroy stateful data (postgres_data = the forum DB). Ask the user, naming the volume."
      fi
      if printf '%s' "$stripped" | grep -qE '(compose|docker-compose).*down.*(-v|--volumes)|^docker-compose.*down.*(-v|--volumes)'; then
        deny "compose down -v deletes the postgres_data volume (all local forum content). Use plain 'down' or ask the user."
      fi
      if printf '%s' "$stripped" | grep -qE 'system[[:space:]]+prune|image[[:space:]]+prune.*(-a|--all)'; then
        deny "docker system/image prune -a is irreversible bulk destruction. Ask the user first."
      fi
      ;;
    dropdb)
      printf '%s' "$stripped" | grep -qE 'dropdb([[:space:]]+-[^ ]+)*[[:space:]]+"?test_' || \
        deny "Dropping a non-test_* database is blocked (the thekotlin DB is the forum). Only test_* DBs may be dropped autonomously."
      ;;
    psql)
      if printf '%s' "$stripped" | grep -qiE 'DROP[[:space:]]+DATABASE' && \
         ! printf '%s' "$stripped" | grep -qiE 'DROP[[:space:]]+DATABASE[[:space:]]+(IF[[:space:]]+EXISTS[[:space:]]+)?"?test_'; then
        deny "DROP DATABASE on a non-test_* database is blocked. Only test_* DBs may be dropped autonomously."
      fi
      ;;
    rm)
      if printf '%s' "$stripped" | grep -qE '(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)' && \
         printf '%s' "$stripped" | grep -qE '(postgres_data|/var/lib/postgresql|[[:space:]]ssl(/| |$)|\.git( |$))'; then
        deny "Recursive rm of a data/ssl/.git directory is blocked. Ask the user, naming the directory."
      fi
      ;;
  esac
done <<EOF
$SEGMENTS
EOF

allow
