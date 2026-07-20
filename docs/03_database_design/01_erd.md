# Entity–Relationship Design

```mermaid
erDiagram
  User ||--o| Partner : owns
  Partner ||--o{ Branch : operates
  Partner ||--o{ Voucher : creates
  Category ||--o{ Voucher : classifies
  Voucher ||--o{ VoucherBranch : available_at
  Branch ||--o{ VoucherBranch : scopes
  User ||--o| Cart : has
  Cart ||--o{ CartItem : contains
  Voucher ||--o{ CartItem : selected
  User ||--o{ Order : places
  Order ||--o{ OrderItem : contains
  Voucher ||--o{ OrderItem : purchased
  Order ||--o| Payment : paid_by
  Order ||--o{ VoucherCode : issues
  Voucher ||--o{ VoucherCode : instantiates
  User ||--o{ VoucherCode : owns
  VoucherCode ||--o{ VoucherUsageLog : records
  Branch ||--o{ VoucherUsageLog : redeems_at
  User ||--o{ Review : writes
  Voucher ||--o{ Review : receives
  User ||--o{ AuditLog : acts
  User ||--o{ RefreshToken : sessions
```

`Banner` and `CmsPage` are independent admin-managed content aggregates.

## Key integrity constraints

- Unique: user email/phone, partner tax code, category name/slug, voucher code, CMS slug.
- Compound unique: partner/title, partner/branch name, cart/voucher, user/voucher review, user/idempotency key.
- Foreign keys preserve ownership across orders, codes, usages, and reviews.
- Indexed lifecycle fields support catalog, admin, and report queries.
- A `VoucherBranch` join table explicitly scopes where a campaign can be redeemed.

The Prisma source of truth is `backend/prisma/schema.prisma`; migrations provide reproducible database creation.
