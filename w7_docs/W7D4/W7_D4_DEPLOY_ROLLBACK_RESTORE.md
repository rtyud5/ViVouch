# W7-D4 — Deploy, Rollback & Restore Checklist

**Project:** ViVouch Marketplace-Lite  
**Task:** W7-D4  
**Owner:** Duy — Release & Quality Lead  
**Status:** PASS  
**Date:** 2026-08-10  
**Depends on:** W7-D3 (readiness/privacy), W7-H3 (health/logs)

---

## Owner matrix (release ops)

| Area | Owner | On failure |
|---|---|---|
| GO/NO-GO, checklists, evidence | **Duy** | Block release until resolved |
| Backend deploy, DB, Prisma migrate, backup/restore | **Huy** | Fix migration/restore first |
| Customer smoke after deploy | **Vinh** | Fix customer path or sign waiver |
| Partner/Admin smoke after deploy | **Tùng** | Fix portal path or sign waiver |
| Payment/webhook/concurrency regression | **Huy** | Backend triage |

Rule: check đỏ → owner của phần đó xử lý trước khi tag release.

---

## 1. Release checklist

Execute in order on the **frozen SHA** (CI green on that commit).

| # | Step | Command / check | Owner | Pass? |
|---|---|---|---|:---:|
| 1 | Confirm frozen SHA + CI green | GitHub Actions: `backend`, `frontend`, `evidence` | Duy | ☐ |
| 2 | Confirm W7-D3 readiness | `/health/live` 200, `/health/ready` 503 when DB down | Duy | ☐ |
| 3 | Record pre-deploy snapshot | `cd backend && node scripts/w6-snapshot-invariants.mjs ../evidence/pre-deploy-snapshot.json` | Huy | ☐ |
| 4 | Backup production/staging DB | `DATABASE_URL='...' bash scripts/backup-db.sh evidence/pre-deploy.dump` | Huy | ☐ |
| 5 | Review pending migrations | `npx prisma migrate status` — **no destructive SQL without plan** (see §4) | Huy | ☐ |
| 6 | Apply migrations (prod) | `npx prisma migrate deploy` — **never** `migrate dev` / `migrate reset` | Huy | ☐ |
| 7 | Deploy backend | Redeploy prior Render/Railway service with new build | Huy | ☐ |
| 8 | Verify backend | `GET /health/live`, `GET /health/ready`, spot-check `/api-docs` | Huy | ☐ |
| 9 | Deploy frontend | Build with correct `VITE_API_BASE_URL`, deploy static bundle | Vinh/Tùng | ☐ |
| 10 | Three-role smoke | Customer checkout, Partner redeem, Admin approve/cancel (mock payOS in CI) | Vinh + Tùng | ☐ |
| 11 | Post-deploy snapshot | Same invariant script → compare counts vs step 3 | Huy | ☐ |
| 12 | Tag release | Git tag only after steps 1–11 pass + Duy GO | Duy | ☐ |

**Existing references:** `docs/08_deployment/01_deployment_plan.md`, `docs/11_w6_w7_marketplace/05_test_release_runbook.md`, `deployment/README.md`.

---

## 2. Rollback / forward-fix checklist

| Scenario | First action | Owner | Notes |
|---|---|---|---|
| **App bug, DB unchanged** | Redeploy **previous** backend/frontend build/image | Huy + portal owner | Migrations are additive; old app can run on new schema for current 13 migrations |
| **Migration failed mid-deploy** | Stop deploy; **do not** re-run blindly; restore DB from step-4 backup if needed | Huy | Forward-fix only after root-cause note in evidence |
| **Data corruption suspected** | Restore to **separate** DB first; run invariant script; then decide cutover | Huy | Never `pg_restore --clean` into production without backup |
| **Partial feature broken** | Forward-fix on hotfix branch + targeted test subset | Feature owner | Prefer forward-fix if rollback window > 30 min demo prep |
| **P0 checkout/redeem/refund** | Immediate app rollback + Duy NO-GO | Duy + Huy | Block tag; open incident note (1 paragraph max) |

### Rollback steps (app-only)

1. Redeploy previous known-good backend artifact.
2. Redeploy matching frontend build (same API base URL era).
3. Confirm `/health/ready` 200.
4. Run canonical smoke subset (checkout idempotent, redeem, admin cancel).
5. Duy records rollback SHA in evidence.

### Forward-fix steps

1. Fix on branch; CI green.
2. Repeat release checklist steps 3–11.
3. No new migration unless required; if required → §4 migration plan.

---

## 3. Restore acceptance checklist

Restore is validated on a **separate database**, never in-place on production first.

| # | Step | Command / expected | Owner | Pass? |
|---|---|---|---|:---:|
| 1 | Create empty target DB | New PostgreSQL database (e.g. `vivouch_restore_audit`) | Huy | ☐ |
| 2 | Restore backup | `TARGET_DATABASE_URL='...' bash scripts/restore-db.sh evidence/pre-deploy.dump` | Huy | ☐ |
| 3 | Migrate status | `DATABASE_URL=$TARGET npx prisma migrate deploy` → no pending failures | Huy | ☐ |
| 4 | **Invariant validation** | `DATABASE_URL=$TARGET node scripts/w6-snapshot-invariants.mjs restore-snapshot.json` → stdout `Invariant check PASSED`, exit 0 | Huy | ☐ |
| 5 | Count sanity | Core tables (`User`, `Order`, `Payment`, `VoucherCode`) counts ≥ pre-deploy snapshot | Huy | ☐ |
| 6 | Backend smoke on restore DB | Point test `DATABASE_URL` at restore DB; run `npm run test:unit:node` + targeted integration subset | Huy | ☐ |
| 7 | Canonical flow spot-check | Login → list vouchers → checkout mock → redeem (against restore DB) | Vinh + Tùng | ☐ |
| 8 | Duy sign restore evidence | Attach dump hash, snapshot JSON, pass/fail | Duy | ☐ |

**Invariant rules enforced by script:**

- `orderItemsWithoutOrder = 0`
- `paymentsWithoutOrder = 0`
- `voucherCodesWithoutOrder = 0`
- `staffWithoutBranch = 0` (STAFF must have branch)

Prior proof: W6-H5 W5-copy migration drill (`w6_acceptance_docs/W6D5/W6H5_W5_COPY_MIGRATION_2026-08-07.md`).

---

## 4. Migration policy — no destructive change without plan

| Rule | Current repo status |
|---|---|
| Production uses **`prisma migrate deploy` only** | Enforced in CI + runbook |
| **No** `migrate reset` on shared/staging/prod | Documented in deployment plan |
| All 13 migrations reviewed | **Forward-only / additive** — no `DROP TABLE`; one index replace (`Order_userId_idx`) is non-data-destructive |
| Future migration with `DROP COLUMN` / `DROP TABLE` / mass `DELETE` | **Requires written plan**: backup ID, rollback SQL or restore procedure, owner sign-off **before** merge |
| W5→W6 upgrade path | Proven on isolated DB (W6-H5); repeat pattern for W7 release candidate |

**Tabletop — migration failure**

| Scenario | Expected gate | Result |
|---|---|---|
| `migrate deploy` fails in CI | PR blocked | PASS (CI job) |
| Destructive migration merged without plan | Duy NO-GO | Policy blocks at step 5 |
| Restore after bad migration | Restore to new DB + invariant script exit 1 if orphans | PASS (script enforced) |

---

## 5. Dependency observation (H4 / V4 / T4)

| Task | Role | Status for D4 | Use in this checklist |
|---|---|---|---|
| **W7-H3** | Platform health/logs | PASS (merged) | Step 2 readiness |
| **W7-H4** | Staging deploy execution | Pending — Huy | Executes §1–3 on staging; D4 defines procedure |
| **W7-V2** | Customer E2E | PASS | Customer smoke steps (V4 not separate; V2 covers canonical customer) |
| **W7-T2** | Partner/Admin E2E | PASS | Partner/Admin smoke steps (T4 not separate; T2 covers cross-role) |

D4 **does not** implement staging automation — checklist only. H4 runs it; V2/T2 proofs satisfy smoke criteria.

---

## 6. Tabletop failure scenarios

| # | Scenario | Expected outcome | Owner |
|---|---|---|---|
| T1 | Backup step skipped | Duy NO-GO at step 4 — release stops | Duy |
| T2 | `migrate deploy` fails | Huy halts; no frontend deploy; restore if partial | Huy |
| T3 | `/health/ready` 503 after deploy | Huy rollback app; check `DATABASE_URL` / pool | Huy |
| T4 | Restore produces orphan rows | Invariant script exit **1** — restore rejected | Huy |
| T5 | App rollback with new schema | Allowed for current additive migrations; document in evidence | Huy |
| T6 | payOS live down during demo | Continue with `VIVOUCH_MOCK` wallet checkout | Huy + Vinh |

All scenarios have clear owner and stop/continue rule — **PASS**.

---

## 7. Acceptance criteria

| Criterion | Verdict |
|---|---|
| No destructive migration without plan | **PASS** — policy §4 + migration audit |
| Restore validates invariants | **PASS** — script queries orphans + exit code |
| Owner rõ | **PASS** — matrix § top |

---

## 8. Commands run (verification)

```powershell
# Invariant script on seeded test DB
cd backend
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/voucher_platform_test?schema=public"
node scripts/w6-snapshot-invariants.mjs ../evidence/w7d4-restore-check.json
# → Invariant check PASSED

npm run test:unit:node
# → 15/15 PASS
```

---

## 9. Files changed (W7-D4)

| File | Change |
|---|---|
| `backend/scripts/w6-snapshot-invariants.mjs` | Real orphan queries + fail exit on broken invariants |
| `w7_docs/W7D4/W7_D4_DEPLOY_ROLLBACK_RESTORE.md` | This checklist |

---

## 10. Next task

- **W7-H4 (Huy):** Execute release + restore drill on staging using this checklist; attach dump + snapshot evidence.
- **W7-D5 / H5:** Frozen SHA + four-owner sign-off after H4 evidence attached.
