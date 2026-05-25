# Final Technology Stack Decision

## 1. Final stack

```text
Frontend: React 18 + Vite + JavaScript
Routing: React Router v6
UI: TailwindCSS + DaisyUI
State/Data fetching: TanStack Query + Zustand
Form/Validation: React Hook Form + Zod
QR: qrcode.react
Chart/Dashboard: Recharts

Backend: Node.js + Express.js + JavaScript
Auth: JWT + bcrypt
Validation: Zod
Database: PostgreSQL
ORM: Prisma
Voucher code: nanoid
Logging: Pino + audit_logs table
Inventory control: PostgreSQL transaction + row-level lock
Optional cache/lock/rate-limit store: Upstash Redis

Testing: Vitest + Supertest
API Docs: Swagger/OpenAPI
Deploy: Vercel + Render + Supabase PostgreSQL
Version control: GitHub + Git Flow
```

## 2. Why JavaScript instead of TypeScript
The team includes weaker developers, so JavaScript reduces:

- Type errors.
- Tooling complexity.
- Generic/interface learning curve.
- Build friction.

The project still remains professional because correctness is enforced through:

- Zod validation.
- Prisma schema.
- PostgreSQL constraints.
- Tests.
- Clear folder architecture.

## 3. Why PostgreSQL instead of MongoDB
The BRD requires a relational database. PostgreSQL is selected because:

- It satisfies the relational database constraint.
- Voucher marketplace data has many relationships.
- It supports transaction and row-level locking.
- It supports foreign keys, unique constraints, enums/checks.
- It is easy to use through Prisma.

## 4. Why DaisyUI instead of shadcn/ui
DaisyUI is selected for team speed:

- Easier class-based components.
- Faster UI for admin tables, cards, modals, badges.
- Less advanced component composition required.
- Works well with TailwindCSS.

## 5. Why Modular Monolith
The project is a student assignment. Microservices would be too heavy. Modular Monolith provides:

- One backend deployment.
- Clear module separation.
- Easy debugging.
- Enough architectural discipline.

## 6. Stack responsibilities summary

| Stack item | Responsibility |
|---|---|
| React | UI screens and user interaction |
| Vite | Development/build tooling |
| React Router | Page routing and role route guards |
| TailwindCSS | Utility CSS |
| DaisyUI | Ready-made UI components |
| TanStack Query | API fetching, caching, refetch |
| Zustand | Small client state: auth user, role, UI |
| React Hook Form | Form state |
| Zod | Input validation frontend/backend |
| qrcode.react | Display simulated voucher QR |
| Recharts | Dashboard charts |
| Express | REST API backend |
| JWT | Login token |
| bcrypt | Password hashing |
| PostgreSQL | Relational data persistence |
| Prisma | ORM/migration/query layer |
| nanoid | Unique voucher code generation |
| Pino | Technical server logs |
| audit_logs | Business traceability |
| Transaction/row lock | Strong consistency for checkout/redeem |
| Vitest/Supertest | Automated API tests |
| Swagger/OpenAPI | API documentation and test UI |
