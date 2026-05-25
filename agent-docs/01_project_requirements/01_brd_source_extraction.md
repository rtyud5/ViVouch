# BRD Source Extraction — Assignment Requirements

This file turns the source BRD into structured implementation requirements for AI agents and developers.

## 1. Project information

| Attribute | Content |
|---|---|
| Topic | Xây dựng hệ thống thương mại điện tử bán voucher giảm giá trực tuyến |
| Course | Thương mại Điện tử |
| Target | Sinh viên ngành Hệ thống thông tin |
| Document type | Business Requirements Document (BRD) |
| Purpose | Standardize business requirements for final project implementation |
| Downstream artifacts | SRS, Use Case Specification, ERD, Activity Diagram, UI Design, Implementation, Test Plan |

## 2. Document purpose
The BRD describes business requirements for an online discount voucher selling system. It standardizes:

- Business scope.
- User roles.
- Operating process.
- Business rules.
- Data requirements.
- Success criteria.

## 3. Short definition

| Term | Meaning |
|---|---|
| Voucher | Electronic discount/benefit certificate used at a partner service provider. |
| Voucher code | Unique issued code attached to a valid purchase order and tracked through its own usage status. |

Important distinction for implementation:

```text
Voucher product/campaign != Issued voucher code
```

A voucher product is sold in the catalog. A voucher code is generated only after successful payment simulation.

## 4. Business context

The voucher marketplace model is common in food, shopping, entertainment, beauty, travel, health, and education. The platform acts as an intermediary between customers and service-providing partners.

## 5. Current problem
Manual or fragmented management causes:

- Hard-to-control issued quantity.
- Hard-to-validate voucher codes.
- Hard-to-track usage status.
- Hard-to-summarize revenue reports.

## 6. Business opportunity
A centralized system can standardize:

- Partner onboarding.
- Voucher review/approval.
- Selling and checkout.
- Simulated payment.
- Code issuance.
- Voucher validation/redemption.
- Reporting.

## 7. General business goal
Build an e-commerce system for online discount vouchers supporting the full process:

```text
Create voucher -> Review/approve -> Sell -> Checkout/payment -> Issue code -> Use/redeem -> Report
```

## 8. Specific goals
The system must:

- Help customers buy vouchers easily.
- Help partners manage voucher programs.
- Help admins operate and monitor the platform.
- Ensure data consistency.
- Be extendable in the future.

## 9. Learning goals
Students must demonstrate ability to:

- Survey/analyze business requirements.
- Model data.
- Design UI.
- Build an application with role-based authorization.
- Test the system.

## 10. In-scope requirements
The project scope includes:

- User management.
- Partner management.
- Voucher management.
- Cart.
- Orders.
- Simulated payment.
- Voucher code issuance.
- Voucher validation/redemption.
- Content management.
- Reporting/statistics.

## 11. Out-of-scope for basic version
Not required in the basic assignment version:

- Real payment gateway.
- Real SMS/email sending.
- Machine learning.
- Native mobile app.
- Real ERP/CRM integration.

Agents must not implement out-of-scope items unless explicitly requested.

## 12. Stakeholders

- Customer.
- Partner.
- Partner staff.
- System admin.
- Instructor.
- Development/testing team.

## 13. Proposed business workflow

```text
Create partner -> Approve partner -> Create voucher -> Approve voucher -> Publish for sale -> Customer buys -> Payment -> Issue code -> Use voucher -> Record reports
```

## 14. High-level requirements

| Code | Requirement | Priority |
|---|---|---|
| BR-01 | Account management | High |
| BR-02 | Voucher category/content management | High |
| BR-03 | Online purchase | High |
| BR-04 | Voucher code issuance and management | High |
| BR-05 | Voucher check and validation | High |
| BR-06 | Review/approval and system monitoring | High |
| BR-07 | Reports and analytics | High |

## 15. Customer requirements

| Code | Requirement | Priority |
|---|---|---|
| BR-CUS-01 | Register account by email/phone; check duplicate; simulated verification | High |
| BR-CUS-02 | Login/logout/forgot/change password/update profile | High |
| BR-CUS-03 | Search and filter vouchers by keyword, category, location, price, discount, partner, validity status | High |
| BR-CUS-04 | View voucher detail: name, image, original price, sale price, terms, validity, remaining quantity, branches, refund/cancel policy | High |
| BR-CUS-05 | Manage cart: add/update/delete and view subtotal | High |
| BR-CUS-06 | Create order from cart, enter buyer/recipient info, choose simulated payment method | High |
| BR-CUS-07 | After successful payment, view voucher code, simulated QR, usage status, order history | High |
| BR-CUS-08 | Review/feedback after purchase/use | Medium |

## 16. Partner requirements

| Code | Requirement | Priority |
|---|---|---|
| BR-PAR-01 | Register/manage business profile, legal info, representative, branches | High |
| BR-PAR-02 | Create voucher with price, description, sale/use dates, branches, quantity | High |
| BR-PAR-03 | Submit voucher for approval and track admin decision | High |
| BR-PAR-04 | Manage vouchers, allowed edits, sold/used/expired counts | High |
| BR-PAR-05 | Check voucher code by input or simulated QR scan | High |
| BR-PAR-06 | Confirm voucher usage; system updates log and prevents reuse | High |
| BR-PAR-07 | Partner reports: revenue, issued count, sold count, usage rate, campaign effectiveness | Medium |

## 17. Admin requirements

| Code | Requirement | Priority |
|---|---|---|
| BR-ADM-01 | Manage users: search, lock/unlock, assign roles | High |
| BR-ADM-02 | Manage partners: approve profile, lock/unlock partner, manage branches | High |
| BR-ADM-03 | Review vouchers: approve, reject, control visibility/lifecycle | High |
| BR-ADM-04 | Manage orders: search orders, payment status, cancel, simulated refund | High |
| BR-ADM-05 | Manage content: categories, banners, articles, popups, policies | Medium |
| BR-ADM-06 | Admin dashboard: users, partners, vouchers, orders, revenue, KPIs | High |
| BR-ADM-07 | System logs for critical operations and traceability | Medium |

## 18. Business rules RB-01..RB-15

| Code | Rule |
|---|---|
| RB-01 | Voucher can only be sold after admin approval. |
| RB-02 | Voucher sale price must be lower than original price. |
| RB-03 | Voucher must have clear sale period and usage period. |
| RB-04 | Voucher cannot be sold when issued quantity is exhausted or sale period is over. |
| RB-05 | Voucher code is issued only after successful payment. |
| RB-06 | Each issued voucher code must be unique and hard to guess. |
| RB-07 | Used voucher cannot be reused unless explicitly designed for multiple uses. |
| RB-08 | Expired, cancelled, or locked vouchers cannot be used. |
| RB-09 | Partner can validate only vouchers within its branch/program scope. |
| RB-10 | User can review only after purchase/use according to rules. |
| RB-11 | Sold quantity cannot exceed issued quantity. |
| RB-12 | Critical admin operations must be recorded in system logs. |
| RB-13 | Cancelled order cannot issue vouchers. |
| RB-14 | Cancellation/refund policy follows voucher terms or platform policy. |
| RB-15 | At ordering/payment time, system must check stock to avoid overselling. |

## 19. Data requirements

| Code | Data group | Description |
|---|---|---|
| DR-01 | Users | Login info, profile, role, transaction history, activity history |
| DR-02 | Partners | Business info, representative, branches, approval status, activity status |
| DR-03 | Voucher products | Name, category, original price, sale price, terms, validity, location, quantity, status |
| DR-04 | Orders | Order code, buyer, order details, total, payment method, order/payment status |
| DR-05 | Issued vouchers | E-code, related order, owner, usage status, issue date, expiry date, usage logs |
| DR-06 | Reviews/feedback | Rating, comment, complaint, resolution response |

## 20. Non-functional requirements

| Code | Group | Requirement | Priority |
|---|---|---|---|
| NFR-01 | Performance | Main operations respond reasonably in demo; voucher/order lookup does not disrupt UX | High |
| NFR-02 | Security | Password hashing, role authorization, no voucher code exposure before payment, admin access control | High |
| NFR-03 | Stability | Stable in demo scope, reasonable error handling, reduce data loss | High |
| NFR-04 | Extensibility | Extend voucher types, reports, marketing campaigns, real payment later | Medium |
| NFR-05 | Usability | Clear UI, clear purchase flow, responsive/mobile-friendly | High |
| NFR-06 | Auditability | Critical admin/transaction actions have logs for traceability | Medium |

## 21. Assumptions

| Code | Assumption |
|---|---|
| ASM-01 | Payment is simulated; real gateway not required. |
| ASM-02 | OTP/email/SMS can be simulated in system notification. |
| ASM-03 | QR scan can be simulated by code input or QR image display. |
| ASM-04 | Data is for learning/demo, not production. |

## 22. Constraints

| Code | Constraint |
|---|---|
| CON-01 | Students must analyze/design themselves; no direct copy of real systems. |
| CON-02 | System must use a relational database. |
| CON-03 | System must have at least 3 roles: customer, partner, admin. |
| CON-04 | System must have enough sample data to prove the business flow. |
| CON-05 | Project must show e-commerce understanding, not just UI. |

## 23. Risks

| Code | Risk |
|---|---|
| RISK-01 | Data design does not correctly reflect voucher lifecycle. |
| RISK-02 | Voucher code generation does not guarantee uniqueness. |
| RISK-03 | Overselling issued quantity due to poor stock control. |
| RISK-04 | Loose authorization exposes admin data. |
| RISK-05 | Unrealistic demo data reduces test and presentation quality. |

## 24. Success KPIs

| Code | KPI | Expected |
|---|---|---|
| KPI-01 | Complete voucher purchase process from search to code issue and usage | Pass |
| KPI-02 | Voucher/order/voucher code states are consistently managed | Pass |
| KPI-03 | Partner can validate vouchers | Pass |
| KPI-04 | Minimal admin dashboard/reports for revenue, orders, vouchers, partners | Pass |
| KPI-05 | Academic documents: BRD, analysis/design, implementation, testing | Pass |

## 25. Acceptance criteria

| Code | Acceptance criterion |
|---|---|
| AC-01 | Main user roles exist. |
| AC-02 | Core workflows exist: create voucher, approve voucher, buy voucher, issue voucher, use voucher. |
| AC-03 | Data states are consistently managed according to business rules. |
| AC-04 | Sample data proves operation scale. |
| AC-05 | Presentation clearly links business requirements and system solution. |

## 26. Deliverables

- Project report.
- Business model/process model.
- Use cases.
- ERD.
- Process diagrams.
- Source code.
- Database script.
- Sample dataset.
- Presentation slides.
- Demo video if required.

## 27. Next recommended documents after BRD

- SRS.
- Detailed use case specification.
- BPMN or Activity Diagram.
- Data dictionary.
- UI design.
- Test plan.
