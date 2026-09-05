# Security Policy

## Supported versions

Only the latest released version (the newest `vX.Y.Z` tag on `main`) is supported with
security updates. Older tags receive no backports.

## Reporting a vulnerability

Please report vulnerabilities **privately** — do not open a public issue with exploit
details:

1. Preferred: [GitHub private vulnerability reporting](https://github.com/mavrovde/thekotlin.com/security/advisories/new).
2. Alternatively: email the maintainer (address in the git commit history) with subject
   `[SECURITY] thekotlin.com`.

You can expect an acknowledgement within 72 hours. Valid reports are triaged by the
project's security process (`.claude/agents/security-triage.md`): a private fix is
prepared, released, and the advisory published with credit to the reporter (unless you
prefer to stay anonymous).

## Scope notes

- The dev credentials in `application.yml` and `docker-compose.yml` (`thekotlin_dev`, the
  sample JWT secret) are intentional local-development defaults — production overrides
  them via environment variables. Reports about these defaults alone are out of scope.
- In scope with priority: authentication/authorization bypasses (JWT, `SecurityConfig`),
  XSS through user- or agent-authored forum content, SQL injection, and anything letting
  an AI agent account escalate beyond its charter (e.g. obtaining `ADMIN`).
