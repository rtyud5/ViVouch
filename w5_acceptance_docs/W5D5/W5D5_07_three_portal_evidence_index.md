# W5-D5 — Three-portal Runtime Evidence Index

**Capture date:** 2026-07-21

**Base SHA:** `523390ae4177daefe1b7dfa99412a7db91b56ae9` plus the W5 closeout patch

**Environment:** local frontend/backend on seeded disposable PostgreSQL; external image requests replaced by a neutral pixel so screenshots do not depend on third-party availability

**Result:** **PASS — 18 valid, non-empty PNG captures; final Partner/Admin run reported no browser page errors**

## Customer — 12 captures

| Scenario | Evidence | Acceptance observation |
|---|---|---|
| Browse and filters | [customer_browse.png](media/customer_browse.png) | seeded vouchers load; filter/sort controls render |
| Voucher detail | [customer_detail.png](media/customer_detail.png) | price, scope, quantity, reviews, and purchase actions render |
| Responsive viewport | [customer_responsive.png](media/customer_responsive.png) | mobile catalog remains usable |
| Unauthenticated guard | [customer_unauth.png](media/customer_unauth.png) | protected checkout redirects to login |
| Profile | [customer_profile.png](media/customer_profile.png) | customer data form loads |
| Orders | [customer_orders.png](media/customer_orders.png) | owned order history loads |
| My vouchers | [customer_my_vouchers.png](media/customer_my_vouchers.png) | issued/used codes render by owner |
| Quantity cap | [customer_qty_limit.png](media/customer_qty_limit.png) | UI clamps invalid high quantity |
| Out of stock | [customer_out_of_stock.png](media/customer_out_of_stock.png) | seeded DB stock change produces stable error state |
| RBAC negative | [customer_rbac.png](media/customer_rbac.png) | Customer token receives clean `403 FORBIDDEN` without stack/path leakage |
| Checkout | [customer_checkout.png](media/customer_checkout.png) | buyer, items, total, and simulated payment render |
| Order success | [customer_success.png](media/customer_success.png) | successful checkout reaches confirmation and issued data |

## Partner — 3 captures

| Scenario | Evidence | Acceptance observation |
|---|---|---|
| Dashboard | [partner_dashboard.png](media/partner_dashboard.png) | Partner KPIs, chart/table states, and navigation load |
| Branch management | [partner_branches.png](media/partner_branches.png) | owned branch list and create/edit/activation controls render |
| Two-step redeem | [partner_redeem.png](media/partner_redeem.png) | code check UI is separate from explicit confirmation |

## Admin — 3 captures

| Scenario | Evidence | Acceptance observation |
|---|---|---|
| Dashboard | [admin_dashboard.png](media/admin_dashboard.png) | platform metrics and recent activity load |
| CMS | [admin_cms.png](media/admin_cms.png) | content create/list/state controls render |
| Audit | [admin_audit.png](media/admin_audit.png) | searchable audit page renders actor/action/date context |

## Integrity

PNG signatures, non-zero file sizes, and Markdown links are checked by `node scripts/verify-evidence.mjs`. Content hashes are recorded in [the evidence manifest](evidence/W5D5_evidence_manifest.sha256).
