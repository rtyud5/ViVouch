# Voucher E-Commerce Platform Skeleton

This repository skeleton is designed for the final project: **online discount voucher e-commerce system**.

Core stack:

- Frontend: React 18 + Vite + JavaScript
- UI: TailwindCSS + DaisyUI
- Data fetching: TanStack Query + Zustand
- Backend: Node.js + Express.js + JavaScript
- Database: PostgreSQL + Prisma
- Auth: JWT + bcrypt
- Validation: Zod
- Voucher code: nanoid
- Logging: Pino + `audit_logs` table
- Consistency: PostgreSQL transaction + row-level lock
- Testing: Vitest + Supertest
- API Docs: Swagger/OpenAPI
- Deploy: Vercel + Render + Supabase PostgreSQL

The codebase is structured as a **Modular Monolith** with clear business modules: Auth, Users, Partners, Branches, Vouchers, Cart, Orders, Payments, Voucher Codes, Reviews, Admin, Reports, Audit Logs.

Use this skeleton as the project frame before implementing actual code.
