# Acceptance Criteria

| ID | Criterion | Required evidence |
|---|---|---|
| AC-01 | Customer, Partner, Admin roles exist and are server-protected | Seed users and RBAC API tests |
| AC-02 | Create → approve → buy → issue → check → confirm flow works | Canonical smoke log and demo capture |
| AC-03 | State transitions remain consistent | Transaction/state-machine tests |
| AC-04 | Seed data proves multiple statuses and business scale | Seed log and UI/database checks |
| AC-05 | Presentation links requirements to implementation and tests | Slide deck, traceability matrix, demo script |

## Release gates

- P0 = 0 and P1 = 0.
- Backend migrations, seed, complete tests, and repeat run pass.
- Frontend tests and production build pass without an oversized main bundle warning.
- Production dependency audits have no high/critical vulnerabilities.
- Evidence links resolve; images are non-empty valid files; checksums verify.
- Known limitations are explicit.
- All 20 W5 tasks are complete or have a ratified waiver.
- Four owners sign the same candidate identifier.
- No release tag is created while any mandatory gate fails.

## Scoring rule

A requirement receives full credit only when implementation, test, and accessible evidence agree. A self-authored statement without reproducible evidence receives no credit. Official academic scoring still requires the instructor’s authoritative weight table.
