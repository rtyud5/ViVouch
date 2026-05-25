# Modular Monolith Module Map

## 1. Module responsibilities

### auth
Responsible for:
- Register.
- Login.
- Logout simulation.
- JWT issue/verify.
- Change password.
- Forgot password simulation.

Files:

```text
auth.routes.js
auth.controller.js
auth.service.js
auth.validator.js
```

### users
Responsible for:
- Customer profile.
- Admin user list/search/lock/unlock.

### partners
Responsible for:
- Partner profile.
- Partner approval/rejection/suspension by admin.
- Branch management.

### vouchers
Responsible for:
- Partner voucher create/update/submit.
- Admin voucher approve/reject/pause.
- Public catalog/list/detail.
- Voucher status lifecycle.

### cart
Responsible for:
- Customer cart.
- Add/update/remove items.

### orders
Responsible for:
- Checkout.
- Order history.
- Simulated cancel/refund.
- Payment orchestration.

### payments
Responsible for:
- Simulated payment status.
- Mock transaction reference.

### voucherCodes
Responsible for:
- Code issuance.
- My vouchers.
- Partner check/redeem.
- Usage log.

### reviews
Responsible for:
- Create review after purchase/use.
- Display ratings.

### reports
Responsible for:
- Admin dashboard.
- Partner dashboard.
- Aggregations.

### auditLogs
Responsible for:
- Business audit records.
- Admin audit log listing/filtering.

### cms
Responsible for:
- Categories.
- Banners.
- Policy/CMS pages.

## 2. Module dependencies

```text
auth -> users
partners -> users, auditLogs
vouchers -> partners, categories, auditLogs
cart -> users, vouchers
orders -> cart, vouchers, payments, voucherCodes, auditLogs
voucherCodes -> vouchers, orders, partners, auditLogs
reports -> users, partners, vouchers, orders, voucherCodes
admin -> users, partners, vouchers, orders, cms, auditLogs
```

## 3. Dependency rules

- `auditLogs` can be called by any module.
- `reports` should read data but not mutate business state.
- `payments` is simulation only.
- `voucherCodes` should not create codes without order/payment context.
- `orders` can orchestrate code issuance during checkout.
- Avoid circular imports by keeping shared helpers in `utils/`.

## 4. Module API ownership

| API group | Owning module |
|---|---|
| `/api/auth/*` | auth |
| `/api/users/*` | users |
| `/api/vouchers/*` | vouchers |
| `/api/customer/cart/*` | cart |
| `/api/customer/orders/*` | orders |
| `/api/customer/voucher-codes/*` | voucherCodes |
| `/api/partner/*` | partners/vouchers/voucherCodes/reports |
| `/api/admin/*` | admin/reports/auditLogs/cms |

## 5. Agent implementation rule
When adding a new feature, place it in the module that owns the business concept. Do not create generic folders like `misc`, `helpers2`, or put business logic into `app.js`.
