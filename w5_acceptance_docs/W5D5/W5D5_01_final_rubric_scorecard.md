# W5-D5 — Final Rubric Scorecard

**Review date:** 2026-07-21

**Code base:** `523390ae4177daefe1b7dfa99412a7db91b56ae9`

**Candidate:** base SHA above plus the W5 closeout patch listed in [the delivery manifest](W5D5_06_delivery_manifest.md)

**Reviewer:** Acceptance & Security Lead

**Technical decision:** **GO to W6**

**Release-tag decision:** **HOLD until the patch is committed, CI is green on that commit, and four owners sign it**

The repository does not contain an authoritative instructor point-weight sheet. The `10.0/10.0` below is therefore a transparent **internal assignment-readiness score**, not a promise of an external grade. No point is awarded from assertion alone: every row links to code, test, documentation, retained log, or captured runtime evidence.

## 1. Final score

| # | Criterion | Points | Concrete evidence |
|---:|---|---:|---|
| 1 | Scope, roles, and business rules are explicit and code-aligned | **1.0/1.0** | [BRD summary](../../docs/01_project_requirements/01_brd_summary.md), [role matrix](../../docs/01_project_requirements/02_roles_and_permissions.md), [business rules](../../docs/01_project_requirements/03_business_rules.md) |
| 2 | Customer portal covers catalog, filters, cart, checkout, orders, codes, profile, and eligible reviews | **1.0/1.0** | [Customer evidence index](W5V5_evidence_index.md), [filter query test](../../frontend/src/features/vouchers/utils/buildVoucherQueryParams.test.js), [review API tests](../../backend/tests/reviews-api.test.js) |
| 3 | Partner portal covers profile, branch CRUD, voucher lifecycle, reports, and check-then-confirm redeem | **1.0/1.0** | [branch API tests](../../backend/tests/partner-branches-api.test.js), [redeem API tests](../../backend/tests/partner-redeem-api.test.js), [Partner Branch runtime capture](media/partner_branches.png), [Partner Redeem runtime capture](media/partner_redeem.png) |
| 4 | Admin portal covers users/roles, partner state, voucher moderation, orders/refunds, CMS, and audit | **1.0/1.0** | [admin management tests](../../backend/tests/admin-management.test.js), [order/audit tests](../../backend/tests/admin-orders-audit.test.js), [CMS tests](../../backend/tests/cms-api.test.js), [Admin CMS runtime capture](media/admin_cms.png) |
| 5 | Checkout, redeem, and review preserve consistency and ownership invariants | **1.0/1.0** | [locking design](../../docs/04_architecture_design/03_consistency_locking_cache.md), [order service](../../backend/src/modules/orders/orders.service.js), [redeem service](../../backend/src/modules/redeem/redeem.service.js), [canonical backend log](evidence/canonical-backend-20260721.log) |
| 6 | Authentication and security controls are enforced | **1.0/1.0** | rotating refresh/replay/logout/password-reset tests in [auth tests](../../backend/tests/auth.test.js), [rate-limit tests](../../backend/tests/rate-limit.test.js), no-client-stack regression in the same auth suite, [security design](../../docs/04_architecture_design/04_security.md) |
| 7 | PostgreSQL schema, migrations, seed, and audit trail are reproducible | **1.0/1.0** | 10 migrations + seed PASS in [canonical backend log](evidence/canonical-backend-20260721.log), [schema](../../backend/prisma/schema.prisma), CMS/audit old-new values in [CMS tests](../../backend/tests/cms-api.test.js) |
| 8 | Automated verification, production build, dependency audit, and CI are real | **1.0/1.0** | backend **179/179**, frontend **20/20**, build PASS, both audits **0** in [backend log](evidence/canonical-backend-20260721.log) and [frontend log](evidence/canonical-frontend-20260721.log); [CI workflow](../../.github/workflows/ci.yml) runs PostgreSQL migrate/seed/test, frontend test/build, audits, and evidence validation |
| 9 | Academic documents, diagrams, demo script, release notes, and presentation are complete | **1.0/1.0** | [documentation index](../../docs/README.md), [demo script](../../docs/09_demo/01_demo_script.md), [release notes](W5D5_05_release_notes.md), [release deck](../../docs/10_presentation/ViVouch_W5_Release_Deck.pptx) |
| 10 | Release governance is evidence-led and prevents an invalid tag | **1.0/1.0** | P0/P1 zero, limitations retained, technical GO separated from tag authorization in [GO/NO-GO record](W5D5_03_go_nogo_record.md), [P2/P3 backlog](W5D5_02_prioritized_backlog.md), and [four-owner sign-off sheet](W5D5_04_release_signoff.md) |
|  | **Internal assignment-readiness total** | **10.0/10.0** | **Every point has evidence; no signature is fabricated.** |

## 2. Canonical verification

| Check | Outcome | Evidence |
|---|---:|---|
| Prisma schema validate + client generation | PASS | [backend log](evidence/canonical-backend-20260721.log) |
| PostgreSQL migration status | PASS — **10 migrations**, schema current | [backend log](evidence/canonical-backend-20260721.log) |
| Deterministic seed | PASS | [backend log](evidence/canonical-backend-20260721.log) |
| Backend full suite | PASS — **20 files, 179 tests** | [backend log](evidence/canonical-backend-20260721.log) |
| Frontend unit suite | PASS — **5 files, 20 tests** | [frontend log](evidence/canonical-frontend-20260721.log) |
| Frontend production build | PASS — route-level chunks, no >500 kB warning | [frontend log](evidence/canonical-frontend-20260721.log) |
| Runtime dependency audit | PASS — backend **0**, frontend **0** | [backend log](evidence/canonical-backend-20260721.log), [frontend log](evidence/canonical-frontend-20260721.log) |
| Customer browser rehearsal | PASS — 12 valid captures, including negative cases and responsive viewport | [Customer evidence index](W5V5_evidence_index.md) |
| Partner browser rehearsal | PASS — dashboard, branch management, two-step redeem | [three-portal evidence index](W5D5_07_three_portal_evidence_index.md) |
| Admin browser rehearsal | PASS — dashboard, CMS, audit | [three-portal evidence index](W5D5_07_three_portal_evidence_index.md) |
| Evidence file/link/signature validation | PASS after final packaging run | [evidence manifest](evidence/W5D5_evidence_manifest.sha256) |

## 3. Review of all 20 W5 tasks

`Closed` means the task's required technical output is now present and reproducible, whether delivered in its original lane or completed by the consolidated D5 remediation. Owner approval is tracked separately and is never inferred from code authorship.

| Task | Final disposition | Evidence |
|---|---|---|
| W5-D1 | **Closed** | BRD/rubric, role, severity, and decision records are superseded by this final pack and [docs index](../../docs/README.md). |
| W5-H1 | **Closed** | Clean PostgreSQL migration/seed/test is retained in the [backend log](evidence/canonical-backend-20260721.log). |
| W5-V1 | **Closed** | Customer route and negative-state inventory is materialized in [12 runtime captures](W5V5_evidence_index.md). |
| W5-T1 | **Closed** | Partner/Admin route inventory and runtime proof are in the [three-portal index](W5D5_07_three_portal_evidence_index.md). |
| W5-D2 | **Closed** | RBAC, ownership, locked/suspended state, stable errors, and no-stack responses are covered by current tests. |
| W5-H2 | **Closed** | Checkout row locks, idempotency, stock, payment, code creation, cancel/refund, and audit are implemented and green. |
| W5-V2 | **Closed** | Review eligibility, complete filters, auth recovery, and session refresh are implemented with tests. |
| W5-T2 | **Closed** | Partner branches/redeem and Admin role/partner/order/CMS operations are implemented with tests and UI. |
| W5-D3 | **Closed** | API/error/security/consistency contracts are code-aligned under [docs](../../docs/README.md). |
| W5-H3 | **Closed** | Contract/security tests are part of the 179-test canonical suite. |
| W5-V3 | **Closed** | Customer responsive and negative-state runtime captures are valid/non-empty. |
| W5-T3 | **Closed** | Partner/Admin pages build and were browser-rehearsed without page errors. |
| W5-D4 | **Closed** | Final cross-role regression supersedes stale partial counts: 179/179 backend and 20/20 frontend. |
| W5-H4 | **Closed** | Clean schema, seed, full regression, and audit rerun are frozen in canonical logs. |
| W5-V4 | **Closed** | Empty placeholders were replaced with 12 actual captures from the candidate. |
| W5-T4 | **Closed** | Partner/Admin API negative matrix, audit assertions, and browser captures are retained. |
| W5-D5 | **Closed technically** | Scorecard, decision, backlog, notes, deck, evidence, and sign-off sheet are delivered; human signatures remain pending. |
| W5-H5 | **Closed technically** | Backend/data evidence is current; Huy must still record an owner-authored approval on the resulting commit SHA. |
| W5-V5 | **Closed technically** | Customer evidence is current; Vinh must still record an owner-authored approval on the resulting commit SHA. |
| W5-T5 | **Closed technically** | Partner/Admin evidence is current; Tùng must still record an owner-authored approval on the resulting commit SHA. |

**Task result:** **20/20 technical dispositions closed.** Formal release authorization remains pending because the four owner approvals are a human gate, not a defect that can be closed by this patch.

## 4. Waiver and scope review

| Item | Basis | Final treatment |
|---|---|---|
| Real payment gateway | Explicitly outside the basic assignment scope | Accepted limitation; a simulated `PAID` payment is clearly labeled. |
| Real email/SMS delivery | Explicitly outside the basic assignment scope | Accepted limitation; reset delivery is simulated and one-time token semantics are tested. |
| CMS | Previously proposed for waiver | **Waiver removed** — categories/pages/banners and Admin UI/API are implemented. |
| Partner Branch UI | Previously proposed for waiver | **Waiver removed** — owned branch create/update/activate/deactivate is implemented. |
| Single-step redeem | No valid waiver | **Waiver removed** — non-mutating check and explicit atomic confirm are implemented. |
| Production auth/storage/observability | Beyond assignment-complete candidate | Recorded honestly as W6/W7 P2/P3 work; not used to excuse a core W5 requirement. |

No unratified waiver is used to award a core point.

## 5. Defect and release snapshot

- Open product P0: **0**.
- Open product P1: **0**.
- W6 P2 and W7 P3 work: explicitly prioritized in the [backlog](W5D5_02_prioritized_backlog.md).
- Internal assignment-readiness score: **10.0/10.0**.
- Formal release authorization: **not yet granted**; the patch needs an immutable commit SHA, green hosted CI on that SHA, and four owner-authored approvals.
