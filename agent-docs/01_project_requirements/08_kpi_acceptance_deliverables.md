# KPI, Acceptance Criteria, and Deliverables

## 1. Success KPIs

| KPI | Expected proof |
|---|---|
| KPI-01 Complete voucher purchase flow | Demo from search -> checkout -> code issue -> redeem |
| KPI-02 Consistent state management | Tables/status badges/API responses show correct lifecycle |
| KPI-03 Partner can validate voucher | Partner redeem check/confirm works and prevents reuse |
| KPI-04 Minimal admin reports | Dashboard with revenue, orders, vouchers, partners |
| KPI-05 Academic documents | BRD, SRS, Use Cases, ERD, Activity Diagrams, Test Plan, README |

## 2. Acceptance criteria checklist

| AC | Checklist item | Evidence |
|---|---|---|
| AC-01 | Roles exist: customer, partner, admin | Seed accounts and RBAC tests |
| AC-02 | Workflows exist: create, approve, buy, issue, use voucher | Demo script and tests |
| AC-03 | States are consistent | State machine and DB enum status |
| AC-04 | Sample data sufficient | Seed script with multiple statuses |
| AC-05 | Presentation links BRD and solution | Slides + requirement traceability matrix |

## 3. Required deliverables folder suggestion

```text
deliverables/
  report/
    project_report.docx or pdf
  diagrams/
    use_case_diagram.png
    erd.png
    checkout_activity_diagram.png
    redeem_activity_diagram.png
    approval_activity_diagram.png
  api/
    openapi.json
    swagger_screenshots/
  database/
    schema.prisma
    migrations/
    seed.js
  testing/
    test_plan.md
    test_cases.xlsx or md
    test_results.md
  presentation/
    slides.pptx
    demo_script.md
  source_code/
    frontend/
    backend/
```

## 4. Demo acceptance path

A successful defense demo should show:

1. Admin, partner, and customer login.
2. Partner creates voucher and submits it.
3. Admin reviews and approves voucher.
4. Customer sees voucher in catalog.
5. Customer adds voucher to cart and checks out.
6. System simulates successful payment and issues a unique code.
7. Customer sees code and QR.
8. Partner checks code and confirms redemption.
9. System prevents redeeming the same code again.
10. Admin dashboard and audit logs update.

## 5. Minimum testing evidence

- Auth API tests.
- RBAC tests.
- Voucher approval tests.
- Checkout transaction tests.
- Voucher code uniqueness tests.
- Redeem validation tests.
- Dashboard/report response tests.

## 6. Presentation claims to prepare

- Why PostgreSQL instead of MongoDB: BRD requires relational database and domain has many relationships.
- Why transaction/row lock: prevents overselling and double redemption.
- Why state machine: prevents invalid voucher/order/code transitions.
- Why audit logs: satisfies traceability and admin monitoring.
- Why simulated payment/QR: allowed by assumptions.
