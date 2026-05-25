# ANTIGRAVITY.md — Gemini + Claude Agent Workflow

Use this file when working in Antigravity or a multi-agent environment with Gemini and Claude.

## Recommended agent roles

### Planner agent
- Reads docs and requirements.
- Produces implementation plan.
- Identifies affected modules and tests.
- Does not edit code.

### Builder agent
- Implements small scoped changes.
- Follows `AGENTS.md` and architecture docs.
- Runs relevant tests.

### Reviewer agent
- Checks against business rules.
- Checks RBAC, transaction, audit log, validation, tests.
- Does not introduce unrelated refactors.

## Handoff format
Every handoff should include:

```text
Task:
Files changed:
Business rules touched:
Tests run:
Known risks:
Next step:
```

## Mandatory checks before accepting changes
- Stack unchanged: React/Express/PostgreSQL/Prisma/JavaScript.
- Voucher and VoucherCode separated.
- Checkout/redeem are transactional.
- RBAC exists on backend.
- Audit logs created for critical actions.
- Tests and Swagger updated.
