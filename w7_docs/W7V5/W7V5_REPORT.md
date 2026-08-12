# W7-V5 - Customer Final Regression & Demo Report

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-V5 - Customer final regression & demo  
**Role:** Customer E2E Lead  
**Date:** 2026-08-12  
**Exact SHA:** `dbb2f74302aeb54512b8b1822267345276b75ed7`  
**Status:** PASS for regression + isolated CI/E2E; customer demo flow NOT EXECUTED because browser runtime was unavailable in this session

## Outcome

- Customer regression on the frozen SHA was verified.
- Frontend unit tests and production build passed.
- Isolated CI/E2E runner passed with dummy payOS env and seeded PostgreSQL.
- Raw backend vitest without a prepared test database failed with the expected environment error `Database "voucher_platform_test" does not exist`, then passed through the isolated runner path.
- No source code files were changed for this task.

## Docs reviewed

- `docs/README.md`
- `docs/01_project_requirements/04_acceptance_criteria.md`
- `docs/11_w6_w7_marketplace/README.md`
- `w6-freeze-evidence.md`
- `tech-debt-w6.md`
- `w7_docs/W7V4/W7V4_REPORT.md`
- `w7_docs/W7V3/W7V3_REPORT.md`
- `w7_docs/W7D2/W7_D2_BRD_CLOSURE.md`
- `w7_docs/W7D3/W7_D3_RUNTIME_READINESS.md`
- `w7_docs/W7D4/W7_D4_DEPLOY_ROLLBACK_RESTORE.md`
- `w7_docs/W7T1/W7_T4_REPORT.md`
- `w7_docs/W7V1/W7V1_REPORT.md`
- `w7_docs/W7V2/W7V2_REPORT.md`

## Evidence

### 1) SHA and worktree

Command:

```bash
git rev-parse HEAD
git status --short
```

Result:

- SHA: `dbb2f74302aeb54512b8b1822267345276b75ed7`
- Worktree: clean

### 2) Frontend regression

Command:

```bash
cd frontend
node node_modules/vitest/vitest.mjs --run
node node_modules/vite/bin/vite.js build
```

Result:

- Vitest: `16` test files passed, `38` tests passed
- Vite build: passed, production bundle emitted successfully

### 3) Raw backend regression check

Command:

```bash
cd backend
node node_modules/vitest/vitest.mjs --run
```

Result:

- Failed in this shell because the local test database `voucher_platform_test` was not present.
- This was an environment/setup failure, not a product logic regression.

### 4) Isolated CI/E2E runner

Command:

```bash
$env:PAYOS_CLIENT_ID='test-client'
$env:PAYOS_API_KEY='test-api-key'
$env:PAYOS_CHECKSUM_KEY='test-checksum-key'
node scripts/run-e2e.mjs "node backend/node_modules/vitest/vitest.mjs --run backend/tests/checkout-api.test.js backend/tests/payos-webhook.test.js backend/tests/reviews-api.test.js backend/tests/refund-concurrency-dedicated.test.js backend/tests/rbac-authorization.test.js"
```

Result:

- PostgreSQL container started.
- Prisma migrations and seed completed.
- Backend and frontend dev servers started.
- Selected customer regression suite passed.
- Final result: `5` files passed, `33` tests passed.

## Customer demo script

1. Open the customer portal on the frozen SHA.
2. Log in with the seeded customer account.
3. Browse vouchers, apply filters, and open a voucher detail page.
4. Add a voucher to cart and complete checkout on the mock payOS flow.
5. Show order success, then open My Vouchers to confirm issued code and QR.
6. Show the safe error path and request reference on a forced failure if needed.

## Viewport rehearsal

- Intended target: clean-session customer rehearsal at `375`, `768`, and `1280` px.
- Browser runtime was not available in this session, so live viewport rehearsal could not be executed here.
- Code-level responsive support remains in the customer/public layouts and pages already verified in W7-V4:
  - `frontend/src/layouts/CustomerLayout.jsx`
  - `frontend/src/layouts/PublicLayout.jsx`
  - `frontend/src/components/common/BottomNav.jsx`
  - `frontend/src/pages/public/HomePage.jsx`
  - `frontend/src/pages/public/VoucherListPage.jsx`
  - `frontend/src/pages/customer/CartPage.jsx`
  - `frontend/src/pages/customer/CheckoutPage.jsx`

## Files changed and evidence

- `w7_docs/W7V5/W7V5_REPORT.md`
- `e2e-failure-log.txt`

## Customer sign-off

- Regression: PASS
- CI/E2E: PASS
- Demo flow: NOT EXECUTED
- Clean-session 3 viewport rehearsal: BLOCKED in this session by unavailable browser runtime

## Next step

- If a browser-capable session becomes available, run the same customer demo script at `375`, `768`, and `1280` px and append screenshots or viewport notes to this report.
