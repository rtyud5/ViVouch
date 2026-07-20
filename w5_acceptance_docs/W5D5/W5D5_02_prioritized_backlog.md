# W6–W7 Prioritized Backlog

**Classification date:** 2026-07-21

**Code base:** `523390ae4177daefe1b7dfa99412a7db91b56ae9` plus the W5 closeout patch

**Current product gate:** **P0 = 0; P1 = 0**

The missing four-owner approval and hosted CI run are release conditions, not product defects. They remain blocking for a release tag and are tracked in the [sign-off sheet](W5D5_04_release_signoff.md), not hidden inside the severity backlog.

## P0 — stop-the-line

**0 open.**

## P1 — W5 release-blocking defects

**0 open.** Previously identified P1 acceptance gaps were closed by this patch: separate redeem check/confirm, valid three-portal evidence, executable CI, completed documentation/deck, and code-aligned task/rubric disposition.

## P2 — W6 hardening

| Priority | ID | Owner | Work item | Definition of Done | Evidence required |
|---:|---|---|---|---|---|
| 1 | P2-AUTH-01 | Huy + Vinh | Move browser sessions from localStorage to secure httpOnly cookies | Access/refresh cookies use `Secure`, `HttpOnly`, appropriate `SameSite`; CSRF defense and rotation/replay semantics pass | threat-model update + API/browser security tests |
| 2 | P2-RATE-01 | Huy + Duy | Replace in-memory rate-limit state with a shared store | Limits remain correct across multiple instances; fail-open/fail-closed behavior is documented | Redis-backed integration test + operational runbook |
| 3 | P2-E2E-01 | Vinh + Tùng + Huy | Add automated three-role browser E2E to CI | Customer checkout/review, Partner redeem, and Admin approval/CMS run headlessly on PostgreSQL in CI | green Playwright artifact and failure screenshots |
| 4 | P2-MAIL-01 | Huy + Vinh | Add a production email provider for password recovery | Tokens are never returned by production responses; delivery, expiry, one-time use, and abuse controls pass | provider sandbox proof + security tests |
| 5 | P2-DATA-01 | Huy + Tùng | Replace remaining demo dashboard series/timeline with aggregates | Admin/Partner charts read range-filtered aggregate endpoints and label empty states correctly | API tests + three viewport captures |
| 6 | P2-API-01 | Huy + Duy | Expand and validate OpenAPI coverage | Every release route has request/response/error schemas; spec generation fails on drift | checked OpenAPI artifact + contract check in CI |
| 7 | P2-OPS-01 | Huy | Add backup/restore and migration rollback rehearsal | A disposable database can be backed up, restored, and rolled forward after rollback rehearsal | retained command log + recovery-time result |
| 8 | P2-ACC-01 | Vinh + Tùng | Accessibility and keyboard pass on all three portals | WCAG AA contrast, focus order, labels, dialogs, tables, and validation states pass | automated scan + manual keyboard checklist |

## P3 — W7 productization

| Priority | ID | Owner | Work item | Definition of Done | Evidence required |
|---:|---|---|---|---|---|
| 1 | P3-PAY-01 | Huy | Integrate an approved payment gateway if scope expands | Signed webhooks are idempotent; reconciliation and refund flows are tested | sandbox transaction/replay evidence |
| 2 | P3-STORAGE-01 | Huy + Tùng | Add object storage and image processing | Signed upload, type/size validation, transformations, lifecycle, and broken-image fallback work | integration tests + storage policy |
| 3 | P3-OBS-01 | Huy + Duy | Add production observability | Structured logs, traces, metrics, dashboards, and alerts cover auth/checkout/redeem/error-rate signals | alert rehearsal + dashboard snapshots |
| 4 | P3-PERF-01 | Huy + Vinh | Establish performance budgets | p95 API latency, DB query counts, bundle weight, and core page metrics stay below agreed budgets | load-test report + CI budget check |
| 5 | P3-I18N-01 | Vinh + Tùng | Consolidate localization and content ownership | No mixed hard-coded language in core screens; CMS owns publishable copy | locale tests + content migration |
| 6 | P3-DATA-02 | Duy + Huy | Add retention/privacy controls | Audit/user data retention, export, and deletion rules are approved and enforced | policy + integration tests |

## Known limitations accepted for the W5 candidate

- Payment and password-reset delivery are simulated; no real financial or email provider is claimed.
- Browser tokens remain in localStorage until P2-AUTH-01.
- Rate-limit counters are per-process until P2-RATE-01.
- Some dashboard series/timeline content remains demo-oriented until P2-DATA-01.
- PostgreSQL is mandatory; SQLite is not a supported runtime.
- This handoff is a patch over base SHA `523390a`; the team must apply it, create one immutable candidate commit, run hosted CI, and sign that exact commit before tagging.
