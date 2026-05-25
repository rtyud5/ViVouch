---
name: voucher-architecture
description: Use when designing or modifying architecture, module boundaries, business rules, state machines, RBAC, transactions, locks, cache, rate limits, or audit logs for the voucher e-commerce project.
---
# Voucher Architecture Skill

Read this before changing architecture-sensitive code.

Core architecture: Modular Monolith with route -> middleware -> controller -> service -> Prisma -> PostgreSQL.

Non-negotiables:
- JavaScript only.
- PostgreSQL + Prisma.
- Voucher and VoucherCode are separate.
- Checkout and redeem must be transactional.
- Backend RBAC is required.
- Critical actions require audit logs.

When asked to implement architecture-related changes:
1. Identify affected module.
2. Check business rules.
3. Preserve state machines.
4. Add/adjust validation.
5. Add/adjust tests.
6. Update Swagger if API changes.
