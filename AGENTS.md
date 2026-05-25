# Agent Instructions

You are working on a student voucher e-commerce project.

Hard constraints:

- Use JavaScript, not TypeScript.
- Architecture: Modular Monolith.
- Frontend: React 18 + Vite + DaisyUI.
- Backend: Express.js + Prisma + PostgreSQL.
- Do not use MongoDB.
- Keep voucher product and issued voucher code as separate concepts.
- Use transaction + row-level lock for checkout and redeem.
- Enforce RBAC: customer, partner, admin.
- Write clear code that weaker team members can understand.

Before coding a feature:

1. Read docs/README.md and related module docs.
2. Check the expected business flow.
3. Keep controller thin and business logic in service.
4. Add validation with Zod.
5. Add audit log for important business actions.
