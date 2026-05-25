# Prompt — Auth and RBAC

Implement authentication and role-based authorization.

Task:
1. Register/login APIs with bcrypt and JWT.
2. Implement `requireAuth`, `requireRole`, `validateBody`, `errorMiddleware`.
3. Implement `/api/auth/me`.
4. Implement frontend login page, auth store, route guards.
5. Implement admin/customer/partner route separation.

Rules:
- Backend RBAC is mandatory.
- Do not rely on frontend hidden buttons.
- Do not return password hash.
- Locked users cannot act.

Acceptance:
- Customer cannot call admin API.
- Partner cannot call admin API.
- Admin can access admin dashboard placeholder.
- Frontend redirects users to correct area after login.
