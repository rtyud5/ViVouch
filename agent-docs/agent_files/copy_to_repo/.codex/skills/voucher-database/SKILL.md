---
name: voucher-database
description: Use when changing Prisma schema, migrations, seed data, database relationships, enums, indexes, or transaction logic.
---
# Voucher Database Skill

Use PostgreSQL with Prisma.
Required core models:
User, Partner, Branch, Category, Voucher, VoucherBranch, Cart, CartItem, Order, OrderItem, Payment, VoucherCode, VoucherUsageLog, Review, AuditLog.

Important constraints:
- User.email unique.
- VoucherCode.code unique.
- Order.orderNumber unique.
- FK relations.
- Status enums.
- Separate voucher product from issued code.

Seed data must support demo with mixed statuses.
