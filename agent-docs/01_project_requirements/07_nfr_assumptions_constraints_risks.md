# NFR, Assumptions, Constraints, and Risks

## 1. Non-functional requirements implementation

| Code | Requirement | Design response |
|---|---|---|
| NFR-01 Performance | Reasonable response in demo | Pagination, indexed queries, TanStack Query cache, optional Redis cache for catalog/dashboard |
| NFR-02 Security | Hash password, role-based authorization, no premature code exposure | bcrypt, JWT, RBAC middleware, voucher code only after paid |
| NFR-03 Stability | Stable demo, error handling, reduce data loss | Central error middleware, transaction/rollback, validation, database constraints |
| NFR-04 Extensibility | Extend voucher types/reports/payment | Modular Monolith, service layer, REST API, Prisma schema |
| NFR-05 Usability | Clear UI, responsive mobile | React, Tailwind, DaisyUI, clear layouts and flows |
| NFR-06 Auditability | Logs for critical operations | `audit_logs` table + Pino technical logs |

## 2. Assumptions and how to implement

| Code | Assumption | Implementation decision |
|---|---|---|
| ASM-01 | Payment simulated | `payments` table with mock methods and status `success/failed/refunded` |
| ASM-02 | OTP/email/SMS simulated | Show UI notification or log; no external provider required |
| ASM-03 | QR simulated | `qrcode.react` displays code; partner can manually input code |
| ASM-04 | Demo data only | Use seed script, not production-grade compliance |

## 3. Constraints and how to satisfy

| Code | Constraint | Required response |
|---|---|---|
| CON-01 | Students analyze/design themselves | Maintain own docs, ERD, use cases; no cloning real system design |
| CON-02 | Relational database | Use PostgreSQL + Prisma, not MongoDB |
| CON-03 | Minimum 3 roles | customer, partner, admin in DB + JWT + route guard |
| CON-04 | Enough sample data | Provide `prisma/seed.js` and demo dataset |
| CON-05 | Show e-commerce understanding | Implement catalog, cart, checkout, payment simulation, code issuance, reporting |

## 4. Risks and mitigation

| Risk | Cause | Mitigation |
|---|---|---|
| RISK-01 Lifecycle modeled poorly | Mixing voucher and voucher code | Separate `vouchers` and `voucher_codes`; state machine |
| RISK-02 Code not unique | Random code collision | nanoid + unique DB index + retry logic |
| RISK-03 Overselling quantity | Concurrent checkout | PostgreSQL transaction + row lock |
| RISK-04 Loose authorization | Only hiding buttons in UI | Backend RBAC + ownership checks |
| RISK-05 Weak demo data | Only one happy-path record | Seed multiple statuses and edge cases |

## 5. Risk-driven test cases

- Attempt checkout when voucher quantity is 0.
- Two checkout requests for the last available voucher.
- Attempt redeem used voucher code.
- Partner A tries to redeem Partner B voucher code.
- Customer tries to access admin API.
- Admin approval action creates audit log.
- Cancelled order does not issue voucher code.

## 6. Agent warning
When implementing, do not optimize for UI first. Prioritize correctness of:

1. Auth/RBAC.
2. Voucher lifecycle.
3. Checkout transaction.
4. Code issuance.
5. Partner redeem transaction.
6. Audit log.
