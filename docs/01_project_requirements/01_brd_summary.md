# Business Requirements Summary

## Product objective

ViVouch centralizes the complete discount-voucher lifecycle:

```text
Partner onboarding → voucher creation → admin approval → public sale → checkout
→ simulated payment → unique code issue → partner check → explicit confirmation → reporting
```

The product separates a sellable `Voucher` campaign from each purchased `VoucherCode`. A code is issued only after payment succeeds and can be consumed once.

## In-scope capability

- Customer registration, authentication, profile, catalog search/filter, cart, checkout, order history, QR/code display, and post-use review.
- Partner profile and branch management, voucher creation/submission/editing, two-step redemption, and operational reports.
- Admin user roles/locks, partner approval/suspension, voucher approval/rejection, order cancellation/refund simulation, CMS content, dashboard, and audit logs.
- PostgreSQL relational persistence, REST APIs, role authorization, transactions, row locks, idempotency, and sample data.

## Out of scope

- Real payment settlement.
- Real email/SMS delivery.
- Native mobile applications.
- ERP/CRM integrations and machine learning.

## Success measures

1. The ten-step demo path completes without manual database edits.
2. Overselling and double redemption are prevented under concurrent requests.
3. Customer, Partner, and Admin permissions are enforced server-side.
4. Critical state changes are auditable.
5. Requirements, design, tests, evidence, and presentation remain traceable to code.

## Assumptions and constraints

The application uses demo data and simulated external services. PostgreSQL is mandatory because transactions and relational integrity are central to the domain. The accepted candidate must have P0/P1 = 0, accessible evidence, explicit limitations, and four owner-authored sign-offs on one frozen candidate identifier.
