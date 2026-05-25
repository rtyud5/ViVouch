# Voucher E-Commerce Final Project — Agent Documentation Pack

This documentation pack is designed for AI coding agents and human developers implementing the final project: **Online Discount Voucher E-Commerce System**.

## Primary source
- Source PDF: `FIT_HCMUS_EC_Project_Assigment_2026_v1.0.pdf`
- Document type: BRD / Business Requirements Document
- Project topic: **Xây dựng hệ thống thương mại điện tử bán voucher giảm giá trực tuyến**
- Course: Thương mại Điện tử
- Target students: Hệ thống thông tin

## Final project direction
Build a **voucher marketplace** with 3 major actors:
1. Customer — buys and uses voucher codes.
2. Partner — creates voucher campaigns and redeems/validates voucher codes.
3. Admin — approves partners/vouchers, manages users/orders/content, and monitors reports.

The system must not be treated as a simple product CRUD site. Its core business value is the end-to-end voucher lifecycle:

```text
Partner creates voucher -> Admin approves -> Customer buys -> Payment simulated -> System issues unique voucher code -> Partner validates/redeems -> Reports and audit logs updated
```

## Final technical stack
- Frontend: React 18 + Vite + JavaScript
- Routing: React Router v6
- UI: TailwindCSS + DaisyUI
- Data fetching: TanStack Query
- Client state: Zustand
- Forms: React Hook Form + Zod
- QR: qrcode.react
- Charts: Recharts
- Backend: Node.js + Express.js + JavaScript
- Auth: JWT + bcrypt
- Backend validation: Zod
- Database: PostgreSQL
- ORM: Prisma
- Voucher code generation: nanoid
- Logging: Pino + database `audit_logs`
- Consistency: PostgreSQL transaction + row-level lock
- Optional: Upstash Redis for rate limit/cache/lock enhancement
- Testing: Vitest + Supertest
- API Docs: Swagger/OpenAPI
- Deploy: Vercel frontend + Render backend + Supabase PostgreSQL
- Version control: GitHub + Git Flow

## How to use this pack
1. Read `00_INDEX.md` first.
2. Use `01_project_requirements/` to understand the BRD and scope.
3. Use `02_tech_stack/` to follow the chosen stack exactly.
4. Use `03_architecture_design/` to implement the system safely and consistently.
5. Copy files from `agent_files/copy_to_repo/` into the actual code repository to guide AI coding tools.
6. Use `04_agent_prompts/` as task-by-task prompts for vibe coding with Codex, Cursor, Gemini/Claude, OpenCode, or GitHub Copilot.

## Non-negotiable rules for agents
- Do not switch to MongoDB; the BRD requires a relational database.
- Do not implement a real payment gateway unless explicitly requested. Use simulated payment.
- Do not expose voucher codes before successful payment.
- Do not allow a used/expired/cancelled/locked voucher code to be redeemed.
- Do not allow a partner to redeem voucher codes from another partner.
- Do not skip RBAC for customer/partner/admin.
- Do not write all business logic in controllers; use service layer.
- Do not skip transaction/lock for checkout and redeem flows.
- Do not delete business-critical records physically; prefer status/soft delete.
