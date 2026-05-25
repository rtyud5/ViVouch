# Business Requirements Matrix

This matrix maps BRD requirements to implementation modules, APIs, database entities, and tests.

## 1. High-level BR mapping

| BR Code | Requirement | Module(s) | Key DB tables | Key APIs | Test focus |
|---|---|---|---|---|---|
| BR-01 | Account management | Auth, Users | users | `/api/auth/*`, `/api/admin/users` | login, role guard, lock/unlock |
| BR-02 | Voucher category/content management | Vouchers, Categories, CMS | vouchers, categories, banners, cms_pages | `/api/vouchers`, `/api/admin/categories` | create/list/filter/status |
| BR-03 | Online purchase | Cart, Orders, Payments | carts, cart_items, orders, order_items, payments | `/api/customer/cart`, `/api/customer/orders/checkout` | checkout success/out-of-stock |
| BR-04 | Voucher code issuance | VoucherCodes, Orders | voucher_codes, order_items | issuance inside checkout | unique code, issued only after paid |
| BR-05 | Voucher check/validation | Redeem, VoucherCodes | voucher_codes, voucher_usage_logs | `/api/partner/redeem/check`, `/confirm` | valid/used/expired/wrong partner |
| BR-06 | Approval/monitoring | Admin, Audit | partners, vouchers, audit_logs | `/api/admin/partners`, `/api/admin/vouchers` | approve/reject, audit log |
| BR-07 | Reports/analytics | Reports, Dashboard | orders, voucher_codes, partners, vouchers | `/api/admin/dashboard`, `/api/partner/reports` | aggregates correct |

## 2. Customer requirement mapping

| Code | Implementation requirement | UI pages | API | DB |
|---|---|---|---|---|
| BR-CUS-01 | Customer signup with duplicate check and simulated verification | Register page | `POST /api/auth/register` | users |
| BR-CUS-02 | Login/logout/forgot/change password/profile | Login/Profile pages | `/api/auth/*`, `/api/customer/profile` | users |
| BR-CUS-03 | Search/filter vouchers | Catalog page | `GET /api/vouchers?...` | vouchers, categories, partners |
| BR-CUS-04 | Voucher detail | Voucher detail page | `GET /api/vouchers/:id` | vouchers, branches, reviews |
| BR-CUS-05 | Cart management | Cart page | `/api/customer/cart/*` | carts, cart_items |
| BR-CUS-06 | Create order + simulated payment | Checkout page | `POST /api/customer/orders/checkout` | orders, order_items, payments |
| BR-CUS-07 | View code/QR/status/history | My vouchers, Order history | `GET /api/customer/voucher-codes`, `GET /api/customer/orders` | voucher_codes, orders |
| BR-CUS-08 | Review/feedback | Review form | `POST /api/customer/reviews` | reviews |

## 3. Partner requirement mapping

| Code | Implementation requirement | UI pages | API | DB |
|---|---|---|---|---|
| BR-PAR-01 | Partner profile/legal/branch info | Partner profile/branches | `/api/partner/profile`, `/api/partner/branches` | partners, branches |
| BR-PAR-02 | Create voucher campaign | Create voucher | `POST /api/partner/vouchers` | vouchers, voucher_branches |
| BR-PAR-03 | Submit voucher approval | Voucher management | `POST /api/partner/vouchers/:id/submit` | vouchers, audit_logs |
| BR-PAR-04 | Manage own vouchers | Voucher management | `GET/PATCH /api/partner/vouchers` | vouchers |
| BR-PAR-05 | Check voucher code | Redeem check page | `GET /api/partner/redeem/check?code=` | voucher_codes |
| BR-PAR-06 | Confirm usage | Redeem confirm page | `POST /api/partner/redeem/confirm` | voucher_codes, voucher_usage_logs |
| BR-PAR-07 | Partner reports | Partner dashboard/report | `GET /api/partner/reports` | orders, voucher_codes |

## 4. Admin requirement mapping

| Code | Implementation requirement | UI pages | API | DB |
|---|---|---|---|---|
| BR-ADM-01 | Manage users | Admin users | `/api/admin/users` | users, audit_logs |
| BR-ADM-02 | Manage partners | Admin partners | `/api/admin/partners` | partners, branches, audit_logs |
| BR-ADM-03 | Review vouchers | Admin voucher review | `/api/admin/vouchers/:id/approve/reject/pause` | vouchers, audit_logs |
| BR-ADM-04 | Manage orders | Admin orders | `/api/admin/orders` | orders, payments, audit_logs |
| BR-ADM-05 | Manage content | Admin CMS | `/api/admin/categories`, `/api/admin/banners`, `/api/admin/cms-pages` | categories, banners, cms_pages |
| BR-ADM-06 | Dashboard | Admin dashboard | `/api/admin/dashboard` | aggregate from DB |
| BR-ADM-07 | System logs | Admin audit logs | `/api/admin/audit-logs` | audit_logs |

## 5. Priority guidance for implementation

### Must-have for MVP
- Auth + RBAC.
- Partner voucher create/submit.
- Admin voucher approve/reject.
- Customer catalog/detail/cart/checkout.
- Voucher code issue after simulated payment.
- Partner code check/redeem.
- Admin dashboard minimal.
- Audit log for critical actions.

### Medium priority
- Reviews.
- CMS pages/banner.
- Advanced partner reports.
- Simulated refund details.

### Future enhancement
- Real payment.
- Real email/SMS.
- Native mobile.
- Advanced promotion engine.
