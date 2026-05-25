# GEMINI.md — Voucher E-Commerce Project Instructions

## Project
Online discount voucher e-commerce system for a university final project.

## Business goal
Implement a voucher marketplace with customer, partner, and admin roles.

Core flow:

```text
Partner creates voucher -> Admin approves -> Customer buys -> Payment simulated -> System issues unique voucher code -> Partner redeems -> Dashboard/audit logs update
```

## Non-negotiable stack
- Frontend: React 18 + Vite + JavaScript
- UI: TailwindCSS + DaisyUI
- Routing: React Router v6
- Data fetching: TanStack Query
- State: Zustand
- Form/validation: React Hook Form + Zod
- QR: qrcode.react
- Charts: Recharts
- Backend: Node.js + Express.js + JavaScript
- Auth: JWT + bcrypt
- Validation: Zod
- Database: PostgreSQL
- ORM: Prisma
- Code generation: nanoid
- Logging: Pino + `audit_logs`
- Tests: Vitest + Supertest
- API docs: Swagger/OpenAPI

## Hard constraints
- Do not use MongoDB. The assignment requires a relational database.
- Do not use TypeScript unless the project owner explicitly changes the decision.
- Do not implement real payment, SMS, or email. Simulate them.
- Do not create microservices.
- Do not put business logic in controllers.

## Architecture
Use Modular Monolith.

Backend module pattern:

```text
routes -> middleware -> controller -> service -> Prisma -> PostgreSQL
```

Business logic belongs in service files.

## Critical business rules
- Voucher can be sold only after admin approval.
- Sale price must be lower than original price.
- Voucher must have sale period and usage period.
- Do not sell expired/out-of-stock vouchers.
- Issue voucher code only after successful simulated payment.
- Voucher code must be unique and hard to guess.
- Used/expired/cancelled/locked code cannot be redeemed.
- Partner can redeem only codes under its own voucher/branch/program.
- Sold quantity must not exceed issued quantity.
- Critical operations must create audit logs.

## Consistency rules
Checkout must be transactional:

```text
validate -> atomic stock update/lock -> create order -> create payment -> issue codes -> audit -> commit
```

Redeem must be transactional:

```text
validate -> lock/conditional update code -> create usage log -> audit -> commit
```

## Required modules
- auth
- users
- partners
- branches
- vouchers
- cart
- orders
- payments
- voucherCodes
- reviews
- admin
- reports
- auditLogs
- cms

## Response format
Use consistent API shape:

```json
{ "success": true, "message": "...", "data": {} }
```

```json
{ "success": false, "message": "...", "code": "ERROR_CODE" }
```

## Testing expectation
Add or update tests for auth, RBAC, voucher approval, checkout, code issue, redeem, and audit logs.

## Documentation expectation
Update Swagger/OpenAPI when adding or changing APIs.

## Implementation style
- Prefer clear, simple JavaScript.
- Keep functions small.
- Avoid clever abstractions.
- Keep code readable for student developers.
- Make small changes and run tests.


## Gemini-specific working style
Use this context as the repository instruction file. When uncertain about library APIs, inspect package docs or existing code before changing files.
