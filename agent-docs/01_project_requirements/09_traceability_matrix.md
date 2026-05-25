# Requirement Traceability Matrix

This matrix helps agents know which files/modules/features must exist for each requirement.

## 1. Module map

| Module | Purpose |
|---|---|
| auth | Login/register/JWT/password/RBAC |
| users | User profile and admin user management |
| partners | Partner profile/approval/branches |
| vouchers | Voucher product lifecycle |
| cart | Customer cart |
| orders | Checkout/order/payment simulation |
| voucherCodes | Code issue/check/redeem |
| reviews | Rating/feedback |
| reports | Admin/partner reports |
| auditLogs | Traceability logs |
| cms | Categories/banner/policies |

## 2. Requirement-to-module mapping

| Requirement | Modules |
|---|---|
| BR-01 | auth, users |
| BR-02 | vouchers, cms |
| BR-03 | cart, orders, payments |
| BR-04 | voucherCodes, orders |
| BR-05 | voucherCodes, partners, auditLogs |
| BR-06 | admin, partners, vouchers, users, auditLogs |
| BR-07 | reports, dashboard |
| BR-CUS-01..02 | auth, users |
| BR-CUS-03..04 | vouchers, categories, public catalog |
| BR-CUS-05..06 | cart, orders |
| BR-CUS-07 | voucherCodes, orders |
| BR-CUS-08 | reviews |
| BR-PAR-01 | partners, branches |
| BR-PAR-02..04 | vouchers |
| BR-PAR-05..06 | voucherCodes, redeem |
| BR-PAR-07 | reports |
| BR-ADM-01 | users |
| BR-ADM-02 | partners |
| BR-ADM-03 | vouchers |
| BR-ADM-04 | orders, payments |
| BR-ADM-05 | cms |
| BR-ADM-06 | reports |
| BR-ADM-07 | auditLogs |

## 3. Requirement-to-database mapping

| Requirement area | Tables |
|---|---|
| Auth/users | users |
| Partner | partners, branches |
| Voucher | vouchers, voucher_branches, categories |
| Cart/order | carts, cart_items, orders, order_items, payments |
| Code issue/use | voucher_codes, voucher_usage_logs |
| Feedback | reviews |
| Admin content | banners, cms_pages |
| Audit | audit_logs |

## 4. Requirement-to-test mapping

| Requirement | Required tests |
|---|---|
| RBAC | Customer cannot call admin API; partner cannot call admin API |
| Voucher lifecycle | Cannot sell unapproved voucher; approved voucher can go on_sale |
| Price rule | salePrice < originalPrice validation |
| Stock rule | Cannot checkout when quantity_available < requested quantity |
| Code issue | Code created only after payment success |
| Code uniqueness | Repeated code generation never violates unique constraint |
| Redeem | Used/expired/cancelled code cannot be redeemed |
| Partner scope | Partner cannot redeem other partner voucher |
| Audit | Approval/redeem/checkout actions create audit logs |
| Dashboard | Report counts match seed data |

## 5. Agent development rule
For every feature implemented, agents must update or verify:

1. API route.
2. Controller.
3. Service.
4. Validation schema.
5. Prisma schema/migration if needed.
6. Frontend page/component if user-facing.
7. Test case for critical business logic.
8. Audit log if action changes business state.
9. Swagger/OpenAPI docs.
