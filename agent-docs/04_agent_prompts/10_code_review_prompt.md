# Prompt — Code Review and Hardening

Review the codebase for project compliance.

Checklist:
1. Tech stack matches final decision: JavaScript, React, Express, PostgreSQL, Prisma.
2. No MongoDB/TypeScript accidental adoption.
3. Voucher and VoucherCode are separate.
4. Checkout uses transaction/atomic update.
5. Redeem uses transaction/conditional update.
6. RBAC exists on backend.
7. Ownership checks exist.
8. Zod validation exists for critical APIs.
9. Audit logs exist for critical actions.
10. Swagger docs are updated.
11. Tests cover business-critical flows.
12. Seed data supports demo.
13. No password hash/token leakage.
14. Error response shape is consistent.

Output:
- List critical issues first.
- Suggest exact files to change.
- Do not refactor unrelated code.
