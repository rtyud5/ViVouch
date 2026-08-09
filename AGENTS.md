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

## Team and AI/Agent Principles
1. **MUST first, BONUS later**: Verify current repo first. Do not rewrite what is already there and passing. If missing, implement only the bare minimum to meet BRD/Acceptance Criteria. STOP when PASS.
2. **No over-engineering**: Do not add Kubernetes, microservices, Redis/queue, monitoring stack, HA, formal SLO/SLA/RTO/RPO or enterprise governance unless explicitly requested.
3. **E2E just enough**: Canonical flow via browser; no need to duplicate all failure cases if lower-level proof exists.
4. **Concise Evidence**: Prefer CI logs, test results, screenshots/traces; maximum one short report per task if needed.
5. **Locked Scope**: Email-only registration; OWNER/STAFF roles; mock CI + max one real payment provider for demo; no SMS auth, multi-gateway, or payout.
