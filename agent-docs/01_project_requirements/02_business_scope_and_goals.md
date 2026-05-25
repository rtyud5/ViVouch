# Business Scope and Goals

## 1. Business identity
This is a **voucher e-commerce marketplace**, not a normal product catalog. The platform sells discount/benefit vouchers created by partners and approved by the platform admin.

## 2. Core business value
The platform solves 4 problems:

1. Centralized voucher publication.
2. Controlled voucher quantity and sale period.
3. Unique issued codes after payment.
4. Reliable partner redemption and admin reporting.

## 3. Business actors

| Actor | Business role |
|---|---|
| Customer | Purchases and uses voucher codes. |
| Partner | Provides service/product, creates voucher campaigns, validates redeemed codes. |
| Partner Staff | Operational staff at branch who checks/redeems voucher code. Can be modeled as partner users or simplified into partner role. |
| Admin | Platform operator who approves partners/vouchers, monitors orders, content, and reports. |

## 4. In-scope capability list

### Customer-facing e-commerce capabilities
- Public voucher catalog.
- Category browsing.
- Search and filter.
- Voucher detail page.
- Cart.
- Checkout.
- Simulated payment.
- Order history.
- My vouchers.
- QR/code display.
- Review/feedback.

### Partner capabilities
- Partner registration/profile.
- Branch management.
- Voucher creation.
- Voucher submission for approval.
- Voucher lifecycle tracking.
- Code check/redeem.
- Partner reports.

### Admin capabilities
- User management.
- Partner approval/rejection/suspension.
- Voucher approval/rejection/pause.
- Order/payment status management.
- Simulated refund/cancel.
- Category/banner/policy content management.
- Dashboard.
- Audit logs.

### Platform internal capabilities
- Auth/RBAC.
- Voucher code generation.
- Transactional checkout.
- Transactional redeem.
- Audit log.
- Validation and error handling.
- API docs.
- Tests.

## 5. Out-of-scope boundaries
Do not implement these in the baseline unless the project owner explicitly asks:

- Real payment gateway.
- Real SMS/email delivery.
- ML recommendation.
- Native mobile app.
- Real ERP/CRM integration.
- Multi-vendor settlement/real accounting.
- Real QR scanner SDK.

These can be documented as future enhancements.

## 6. Business goals mapped to system goals

| Business goal | System design response |
|---|---|
| Customers buy easily | Search, filter, detail, cart, checkout, my vouchers. |
| Partners manage programs | Partner portal, voucher CRUD, submission, status tracking, reports. |
| Admin operates platform | Admin dashboard, approval flows, user/order/content management. |
| Data consistency | PostgreSQL, Prisma, FK, enum statuses, transaction, row lock. |
| Expand later | Modular Monolith, service layer, clean API, relational schema, Swagger. |

## 7. The most important demo story

```text
Partner creates voucher -> Admin approves -> Customer buys -> Payment simulated -> Voucher code generated -> Partner redeems -> Admin sees dashboard/audit log
```

If this story works end-to-end, the project demonstrates the full business process.
