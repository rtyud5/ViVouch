# MVP Phase Plan

## Phase 0 — Project setup
Deliverables:

- Monorepo structure.
- Frontend Vite React app.
- Backend Express app.
- Prisma/PostgreSQL connection.
- Health endpoint.
- Basic README.

## Phase 1 — Database and seed
Deliverables:

- Prisma schema.
- Migrations.
- Seed accounts/categories/vouchers.
- Prisma Studio verification.

## Phase 2 — Auth and RBAC
Deliverables:

- Register/login.
- JWT middleware.
- Role middleware.
- Frontend auth store.
- Role routes.

## Phase 3 — Partner and voucher creation
Deliverables:

- Partner profile.
- Branch management.
- Create/edit voucher draft.
- Submit voucher for approval.

## Phase 4 — Admin approval
Deliverables:

- Admin voucher list.
- Approve/reject voucher.
- Partner approval if implemented.
- Audit logs.

## Phase 5 — Customer catalog/cart
Deliverables:

- Public catalog.
- Search/filter.
- Detail page.
- Cart add/update/remove.

## Phase 6 — Checkout and code issue
Deliverables:

- Checkout API transaction.
- Mock payment success.
- Voucher code generation.
- My vouchers page with QR.

## Phase 7 — Partner redeem
Deliverables:

- Check code API.
- Confirm redeem API transaction.
- UI result states.
- Prevent double redeem.

## Phase 8 — Dashboard/reporting
Deliverables:

- Admin dashboard.
- Partner dashboard.
- Recharts charts.

## Phase 9 — Tests/docs/deploy
Deliverables:

- Vitest/Supertest key tests.
- Swagger docs.
- Vercel/Render/Supabase deploy.
- Demo script.

## Phase priority rule
Do not start advanced UI polish until checkout and redeem work correctly.
