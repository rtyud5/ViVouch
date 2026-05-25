# Prompt — Prisma/PostgreSQL Database

Implement database foundation for voucher marketplace.

Read:
- `docs/01_project_requirements/06_data_requirements_and_domain_entities.md`
- `docs/03_architecture_design/10_database_design_prisma_guide.md`

Task:
1. Configure Prisma with PostgreSQL.
2. Create models: User, Partner, Branch, Category, Voucher, VoucherBranch, Cart, CartItem, Order, OrderItem, Payment, VoucherCode, VoucherUsageLog, Review, AuditLog, Banner, CmsPage.
3. Add enums for roles/statuses.
4. Add required unique indexes and relationships.
5. Create seed script with demo accounts, categories, partners, vouchers, orders, voucher codes, audit logs.

Rules:
- Do not use MongoDB.
- Separate Voucher and VoucherCode.
- Use integer prices.
- Include sale period and valid usage period.

Acceptance:
- `npx prisma migrate dev` succeeds.
- `npm run seed` creates demo data.
- Prisma Studio shows complete relationships.
