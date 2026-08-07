# W6 Risk and Exception Register — Closed Gate

**Frozen code candidate:** `6c542363d1beeebf6173988ef9cac15c3dae40cb`
**Updated:** 2026-08-07 (UTC+07)
**Gate:** GO — staging-ready core

## Closed in W6

| ID | Result |
|---|---|
| Test-runner separation | Closed — Node and Vitest suites run independently. |
| Fixture isolation | Closed — full backend suite passed repeatedly on a fresh PostgreSQL database. |
| Evidence-link validation | Closed — validator passes with 76 files checked. |
| Backend dependency audit | Closed — production audit has zero high/critical findings. |
| Empty-database migration | Closed — all 13 migrations and seed passed. |

## Authorized process exceptions

| ID | Scope | Owner decision | Required W7 follow-up |
|---|---|---|---|
| W6-EXC-001 | W5-copy migration drill unavailable | Accepted by repository owner for W6 gate | Backup/restore into a new database and post-restore smoke before release candidate. |
| W6-EXC-002 | Individual four-owner sign-off omitted | Replaced by owner-authorized Codex technical gate validation | Define release sign-off policy before W7 release candidate. |
| W6-EXC-003 | Full manual browser E2E not retained for frozen candidate | Accepted because automated coverage and build are green | Run Customer and cross-role browser E2E in W7. |

## Deferred W7 quality work

| ID | Severity | Work |
|---|---:|---|
| W7-COV-001 | P2 | Publish coverage and Sonar artifacts. |
| W7-RUNTIME-001 | P2 | Refresh GitHub Actions runtime configuration. |
| W7-DEP-001 | P2 | Upgrade the frontend router line to address remaining moderate production audit findings without breaking React Router v6 behavior. |
