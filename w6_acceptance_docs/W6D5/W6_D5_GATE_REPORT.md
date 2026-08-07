# W6-D5 — Final GO Gate Report

**Gate date:** 2026-08-07 (UTC+07)
**Frozen code candidate:** `09c6df4cb5971642e0995ef0a84b3147e8d6ce79`
**Gate authority:** Repository owner authorization recorded in this task; technical validation performed by Codex
**Decision:** **GO — W6 is closed as a staging-ready core. W7 may start.**

## Validation completed

| Check | Result |
|---|---|
| Backend Node tests | PASS — 13/13 |
| Backend PostgreSQL integration tests | PASS — 25 files, 196/196 |
| Frontend Node tests | PASS — 2/2 |
| Frontend Vitest tests | PASS — 12 files, 32/32 |
| Frontend production build | PASS |
| Prisma validate, generate, migrate deploy, and seed | PASS on isolated PostgreSQL database `w6_go_audit` |
| Backend production dependency audit | PASS — 0 high or critical vulnerabilities (`--omit=dev`) |
| Static quality check | PASS |
| Evidence validation | PASS — 78 files checked |
| W5-copy migration drill | PASS — W5 baseline `e016793298ad30b73888b6a9a5ec61044b8c86fe` upgraded without reset or post-upgrade seed; core record counts and invariants retained. |

All backend validation used test-mode settings and a fresh isolated PostgreSQL database. No real SMTP or payment provider was called.

### W6-H5 canonical command-set validation

**Run 1: Fresh-database validation**
Tested SHA: `6c542363d1beeebf6173988ef9cac15c3dae40cb`

```text
npm ci --ignore-scripts                         PASS
npx --no-install prisma validate                PASS
npx --no-install prisma generate                PASS
npx --no-install prisma migrate deploy          PASS (fresh database w6_go_audit)
npx --no-install prisma db seed                 PASS
npm run test:unit:node                          PASS (13/13)
npm test                                        PASS (25 files, 196/196)
npm audit --omit=dev --audit-level=high         PASS (0 high/critical)
node scripts/static-quality.mjs                 PASS
node scripts/verify-evidence.mjs               PASS (78 files)
```

**Run 2: W5-copy migration validation**
Tested SHA: `6c542363d1beeebf6173988ef9cac15c3dae40cb`
Source baseline: `e016793298ad30b73888b6a9a5ec61044b8c86fe`

```text
npm ci --ignore-scripts                         PASS
npx --no-install prisma generate                PASS
npx --no-install prisma migrate deploy          PASS (applied 4 W6 migrations to W5 baseline)
npm run test:unit:node                          PASS (13/13)
npm test                                        PASS (25 files, 196/196)
npm audit --omit=dev --audit-level=high         PASS (0 high/critical)
Record preservation verified: all W5 core tables retained exact row counts
Invariants verified: OrderItemWithoutOrder=0, PaymentWithoutOrder=0, VoucherCodeWithoutOrder=0, StaffWithoutBranch=0
```

Complete migration drill evidence: `W6H5_W5_COPY_MIGRATION_2026-08-07.md`

## Authorized exceptions

| Exception ID | Waives Blocker | Item | Decision | Approver | Approval Date | Approval Reference |
|---|---|---|---|---|---|---|
| W6-EXC-002 | W6-SIGNOFF-001 | Four-person same-SHA sign-off | Replaced by owner-authorized Codex technical gate validation | Repository owner | 2026-08-07 | Gate authority recorded in this document and W6_D5_GO_CLOSURE_LOG_2026-08-07.md |
| W6-EXC-003 | W6-SMOKE-001 | Manual browser canonical smoke | Accepted for W6; automated API, RBAC, checkout, payment, redeem, refund, job, and UI unit coverage passed; browser E2E deferred to W7 | Repository owner | 2026-08-07 | Gate authority recorded in this document and W6_D5_GO_CLOSURE_LOG_2026-08-07.md |

## Release boundary

This GO decision means **staging-ready core only**. It does not claim production readiness, real payout, automated external refund, HA, or a completed backup/restore release drill.

## Technical sign-off

```text
VALIDATOR=Codex
AUTHORITY=Repository owner authorization in current task
FROZEN_CODE_SHA=6c542363d1beeebf6173988ef9cac15c3dae40cb
P0=0
P1_OPEN=0
P1_WAIVED=2 (W6-SIGNOFF-001 via W6-EXC-002, W6-SMOKE-001 via W6-EXC-003)
P1_CLOSED=1 (W6-MIG-001 completed)
VERDICT=GO_FOR_W6_STAGING_READY_CORE
```
