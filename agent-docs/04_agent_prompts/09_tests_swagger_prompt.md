# Prompt — Tests and Swagger/OpenAPI

Implement test and API documentation layer.

Task:
1. Add Vitest + Supertest setup.
2. Add tests for auth/RBAC, voucher approval, checkout, redeem.
3. Add Swagger/OpenAPI docs at `/api-docs`.
4. Document required roles, request body, success/error responses.

Minimum tests:
- Login success/failure.
- Customer blocked from admin API.
- Partner creates/submits voucher.
- Admin approves voucher.
- Checkout issues code.
- Out-of-stock checkout fails.
- Partner redeems code once.
- Used code cannot be redeemed again.
- Wrong partner cannot redeem.

Acceptance:
- `npm test` passes.
- `/api-docs` shows Auth, Voucher, Order, Partner, Admin, Redeem groups.
