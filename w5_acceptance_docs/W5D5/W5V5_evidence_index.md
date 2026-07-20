# W5-V5 — Customer Portal Evidence Index

**Final D5 recapture:** 2026-07-21

**Base SHA:** `523390ae4177daefe1b7dfa99412a7db91b56ae9` plus W5 closeout patch

**Environment:** seeded disposable PostgreSQL, live backend/frontend

**Status:** **PASS — 12/12 valid non-empty captures**

| Flow | Clickable evidence | API / contract | Automated proof |
|---|---|---|---|
| Browse + complete filters | [customer_browse.png](media/customer_browse.png) | `GET /api/vouchers` with search/category/city/partner/price/discount/sort/page | [query builder test](../../frontend/src/features/vouchers/utils/buildVoucherQueryParams.test.js), backend canonical suite |
| Voucher detail + review eligibility | [customer_detail.png](media/customer_detail.png) | `GET /api/vouchers/:id`, `GET /api/vouchers/:id/review-eligibility` | [review tests](../../backend/tests/reviews-api.test.js) |
| Protected route | [customer_unauth.png](media/customer_unauth.png) | unauthenticated checkout redirects to `/login` | auth suite in [backend log](evidence/canonical-backend-20260721.log) |
| Profile | [customer_profile.png](media/customer_profile.png) | owned customer profile | backend canonical suite |
| Order history | [customer_orders.png](media/customer_orders.png) | `GET /api/customer/orders` | order tests in [backend log](evidence/canonical-backend-20260721.log) |
| My vouchers | [customer_my_vouchers.png](media/customer_my_vouchers.png) | `GET /api/customer/voucher-codes` | voucher-code ownership tests |
| Quantity cap | [customer_qty_limit.png](media/customer_qty_limit.png) | invalid high quantity is clamped/blocked | frontend branch/quantity logic + checkout tests |
| Out of stock | [customer_out_of_stock.png](media/customer_out_of_stock.png) | `VOUCHER_OUT_OF_STOCK` and no order mutation | checkout tests |
| RBAC negative | [customer_rbac.png](media/customer_rbac.png) | Customer token calls Admin endpoint → clean `403 FORBIDDEN` | [auth tests](../../backend/tests/auth.test.js), including no `stack` assertion |
| Checkout | [customer_checkout.png](media/customer_checkout.png) | transactional checkout and simulated payment | backend checkout suite |
| Order success | [customer_success.png](media/customer_success.png) | order, payment, and voucher codes committed | backend checkout suite |
| Responsive mobile | [customer_responsive.png](media/customer_responsive.png) | 390px viewport | browser capture |

All media lives under `w5_acceptance_docs/W5D5/media/`. Validity and relative links are checked by `node scripts/verify-evidence.mjs`; hashes are retained in [the manifest](evidence/W5D5_evidence_manifest.sha256).
