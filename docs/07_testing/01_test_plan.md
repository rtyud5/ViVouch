# Test Plan

## Objectives

Prove RBAC, lifecycle correctness, transaction safety, two-step redemption, content management, and the ten-step acceptance path on one reproducible candidate.

## Automated scope

| Area | Core cases |
|---|---|
| Auth | register duplicates, login, locked account, access JWT, refresh rotation/replay, logout, simulated reset |
| RBAC | unauthenticated and wrong-role requests for protected groups |
| Partner | profile, branches ownership/CRUD, voucher create/edit/submit, reports |
| Catalog | active status/date/stock, keyword/category/city/price/discount/partner filters |
| Cart/checkout | quantities, stock, idempotency, code issue, rollback |
| Redeem | check non-mutation; confirm; used/expired/wrong partner/branch; double-use prevention |
| Review | eligibility, used-code requirement, duplicate/rating validation |
| Admin | approvals, roles, locks, suspend/reactivate, orders, cancel/refund, dashboard, audit filters |
| CMS | category/page/banner CRUD and public publication rules |
| Security | rate-limit 429 contract, dependency audit, production environment validation |
| Frontend | filter mapping, idempotency keys, API hooks, branch selection, production build |

## Canonical commands

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm test
npm test
npm audit --omit=dev --audit-level=high

cd ../frontend
npm ci
npm test -- --run
npm run build
npm audit --omit=dev --audit-level=high

cd ..
node scripts/verify-evidence.mjs
```

## Manual acceptance

Run the demo script at desktop, tablet, and mobile widths. Capture console/network status, key state transitions, and all three portals. A manual result is `SKIP`, not `PASS`, when the browser session or media is unavailable.

## Exit criteria

All automated checks pass twice where state leakage is a risk; P0/P1 are zero; failed/skipped checks are reported honestly; logs identify the frozen candidate; evidence checksums verify.
