---
name: voucher-backend
description: Use when implementing Express backend modules, APIs, services, validation, auth, RBAC, audit logs, checkout, or voucher redemption.
---
# Voucher Backend Skill

Use Express + JavaScript. Keep controllers thin and services rich.

Required middleware:
- requireAuth
- requireRole
- validateBody/Query/Params
- errorMiddleware
- rateLimit for sensitive APIs

Critical flows:
- Checkout: transaction, stock update, order/payment/code issue, audit.
- Redeem: transaction, ownership check, code status update, usage log, audit.

Do not expose passwordHash or voucher code before payment success.
