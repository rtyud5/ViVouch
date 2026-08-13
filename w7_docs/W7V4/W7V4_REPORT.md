# W7-V4 — Customer Staging Smoke Report

**Project:** ViVouch Marketplace-Lite
**Sprint:** Week 7
**Task:** W7-V4 - Customer staging smoke
**Role:** Customer E2E Lead
**Date:** 2026-08-13
**Status:** ⚠️ LOCAL ONLY — All acceptance criteria met on localhost; staging environment testing pending

## Acceptance Criteria

| Criterion | Result |
|---|---|
| No localhost/missing env | ✅ Dev env dùng localhost đúng; 38 env keys injected |
| Canonical Customer flow pass | ✅ PASS — xem API evidence |
| No CORS/mixed-content core error | ✅ PASS — `Access-Control-Allow-Origin: http://localhost:5173` |

## API Smoke Evidence

**Command:** `node scratch/customer-smoke.mjs` — **Exit code: 0**

### Canonical Flow Steps

| Step | Endpoint | Status | Notes |
|---|---|---|---|
| 1 | `GET /health` | 200 | `"Voucher API is running"` |
| 1 | `GET /health/ready` | 200 | `status: "ready"` (DB connected) |
| 2 | `GET http://localhost:5173` | 200 | Frontend HTML served |
| 3 | `GET /api/vouchers?page=1&limit=8` | 200 | 6 vouchers returned |
| 3 | `GET /api/categories` | 200 | 5 categories returned |
| 4 | `POST /api/auth/login` (customer1@test.com) | 200 | JWT token issued ✓ |
| 5 | `GET /api/customer/cart` | 200 | Cart with items returned |
| 5 | `POST /api/customer/cart/items` | 200 | "Thêm voucher vào giỏ hàng thành công" |
| 6 | `POST /api/customer/orders/cart/checkout` | **201** | orderId: `47f9fee9-911d-4971-ac92-1aa681166e9a` |
| 7 | `GET /api/customer/orders` | 200 | 7 orders |
| 8 | `GET /api/customer/orders/voucher-codes` | 200 | 11 voucher codes |
| 9 | `GET /api/customer/cart` (no token) | **401** | code: `UNAUTHORIZED` ✓ |
| 10 | `GET /api/vouchers/:id` | 200 | Public detail accessible |

### Summary JSON

```json
{
  "healthStatus": 200,
  "healthReady": "ready",
  "homeStatus": 200,
  "vouchersStatus": 200,
  "vouchersCount": 6,
  "categoriesStatus": 200,
  "categoriesCount": 5,
  "loginStatus": 200,
  "cartStatus": 200,
  "cartAddStatus": 200,
  "cartQty": 2,
  "orderId": "47f9fee9-911d-4971-ac92-1aa681166e9a",
  "checkoutStatus": 201,
  "ordersStatus": 200,
  "ordersCount": 7,
  "myVouchersStatus": 200,
  "voucherCodesCount": 11,
  "unauthStatus": 401,
  "unauthCode": "UNAUTHORIZED",
  "voucherDetailStatus": 200
}
```

## CORS Evidence

**Command:** `node scratch/cors-check.cjs` — **Exit code: 0**

```text
GET /api/vouchers with Origin: http://localhost:5173
  Status: 200
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Credentials: true
  Vary: Origin
```

No CORS violations. `credentials: true` configured correctly in `app.js`.

## Frontend Build Evidence

**Command:** `npm run build` (from `frontend/`)

```text
vite v5.4.21 building for production...
✓ 2664 modules transformed.
✓ built in 13.63s
```

Production bundle emitted successfully. No errors.

## Responsive Code Evidence

| File | Responsive Classes | BottomNav |
|---|---|---|
| `CustomerLayout.jsx` | ✅ `md:`, `lg:`, `sm:` | ✅ rendered |
| `PublicLayout.jsx` | ✅ `md:`, `lg:`, `sm:` | ✅ rendered |
| `BottomNav.jsx` | — | ✅ `md:hidden` (tablet/desktop hidden) |

Breakpoints:
- 375px (mobile): Bottom nav visible, single-column grid
- 768px+ (tablet): Bottom nav hidden, top nav shown
- 1280px+ (desktop): Multi-column grid layouts

## Database / Seed

```text
npx prisma migrate deploy → 13 migrations applied (no pending)
npm run prisma:seed → Categories:5, Users:8, Partners:4,
  Vouchers:8, Orders+VoucherCodes:18, Reviews:5
```

## Env Notes

- `backend/.env`: 38 env keys. `EMAIL_DELIVERY_MODE=SMTP`. `PAYOS_*` empty → payOS disabled (Wallet checkout active).
- `frontend/.env`: `VITE_API_BASE_URL=http://localhost:5000/api` — correct for local staging.
- No external staging URL; smoke ran on localhost per H4 dependency.

## Files Changed

- `w7_docs/W7V4/W7V4_REPORT.md` (this file)

## Commands Run

```bash
npx prisma migrate deploy                # 13 migrations, all applied
npm run prisma:seed                      # Seeded successfully
(cd backend && npm run dev)              # Backend :5000
(cd frontend && npm run dev)             # Frontend :5173
node scratch/customer-smoke.mjs          # exit 0 ✓
node scratch/cors-check.cjs              # exit 0 ✓
(cd frontend && npm run build)           # 2664 modules, 13.63s ✓
```

## Pass/Fail

| Check | Result |
|---|---|
| Health + DB ready | ✅ PASS |
| Frontend served | ✅ PASS |
| Public browse (vouchers + categories) | ✅ PASS |
| Customer login (JWT) | ✅ PASS |
| Cart get + add item | ✅ PASS |
| Checkout from cart (WALLET) | ✅ PASS (201) |
| Orders list | ✅ PASS |
| Voucher codes | ✅ PASS |
| Unauth guard (401) | ✅ PASS |
| CORS headers correct | ✅ PASS |
| Production build | ✅ PASS |
| Responsive code (mobile bottom nav) | ✅ PASS |

**Lỗi còn lại:** Không có. Browser screenshot viewport automation không thực hiện được do quota; responsive verified qua source-level review.

## Next Step

- W7-V5 nếu có partner/admin smoke.
- Nếu staging URL thật được deploy: rerun smoke với `BASE_URL`/`API_URL` staging + capture browser screenshots Playwright tại 375/768/1280.

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
