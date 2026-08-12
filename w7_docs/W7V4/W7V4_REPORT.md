# W7-V4 - Customer Staging Smoke Report

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-V4 - Customer staging smoke  
**Role:** Customer E2E Lead  
**Date:** 2026-08-12  
**Status:** PARTIAL PASS - core customer smoke passed in isolated runner

## Outcome

- Customer canonical flow verified end-to-end on the isolated runner with seeded demo data.
- No screenshots were used; evidence is from command output and HTTP/request checks.
- Frontend production build passed.
- Responsive layout is supported by code-level responsive classes on customer/public layouts.

## Evidence

### Customer smoke runner

Command:

```bash
node scripts/run-e2e.mjs node C:/Users/user/AppData/Local/Temp/vivouch-w7v4-customer-smoke.mjs
```

Key results:

- `homeStatus: 200`
- `vouchersStatus: 200`
- `cartQty: 3`
- `checkoutStatus: 201`
- `replayStatus: 200`
- `replayIdempotent: true`
- `voucherCodesIssued: 3`
- `ordersCount: 7`
- `codesCount: 10`
- `unauthStatus: 401`
- `unauthCode: UNAUTHORIZED`

### Frontend build

Command:

```bash
node node_modules/vite/bin/vite.js build
```

Result:

- Build passed.
- Vite reported `2664 modules transformed` and emitted the production bundle successfully.

### Responsive code review refs

- [frontend/src/layouts/CustomerLayout.jsx](/../../frontend/src/layouts/CustomerLayout.jsx)
- [frontend/src/layouts/PublicLayout.jsx](/../../frontend/src/layouts/PublicLayout.jsx)
- [frontend/src/components/common/BottomNav.jsx](/../../frontend/src/components/common/BottomNav.jsx)
- [frontend/src/pages/public/HomePage.jsx](/../../frontend/src/pages/public/HomePage.jsx)
- [frontend/src/pages/public/VoucherListPage.jsx](/../../frontend/src/pages/public/VoucherListPage.jsx)
- [frontend/src/pages/customer/CartPage.jsx](/../../frontend/src/pages/customer/CartPage.jsx)
- [frontend/src/pages/customer/CheckoutPage.jsx](/../../frontend/src/pages/customer/CheckoutPage.jsx)

Observed responsive patterns:

- Mobile bottom nav is hidden on `md+`.
- Desktop nav appears on `md+`.
- Grid layouts switch from 1 column to multi-column at `sm/md/lg`.
- Customer pages add bottom padding on mobile to avoid nav overlap.

## Env issues

- No deployed staging URL was provided in the repo, so the smoke was run on the isolated local runner (`localhost`).
- Browser viewport automation for 375/768/1280 was not available in this session, so the responsive check is code-level only.

## Files changed

- `w7_docs/W7V4/W7V4_REPORT.md`

## Next step

- If a real staging URL becomes available, rerun the same smoke against that URL and capture viewport evidence for 375/768/1280.
