# Data Requirements and Domain Entities

## 1. Domain model principle
The domain must separate:

```text
Voucher campaign/product
Issued voucher code
Order and payment
Usage/redemption log
Audit log
```

Do not collapse everything into a single `vouchers` table.

## 2. Core entities

### User
Represents all accounts: customer, partner account, admin.

Suggested fields:

```text
id
email
phone
password_hash
full_name
role
status
created_at
updated_at
deleted_at
```

### Partner
Business profile linked to a user account.

```text
id
user_id
business_name
legal_name
tax_code
representative_name
representative_phone
address
status
rejection_reason
created_at
updated_at
```

### Branch
Partner branch where voucher can be used.

```text
id
partner_id
name
address
city
district
phone
status
created_at
updated_at
```

### Category
Voucher category.

```text
id
name
slug
description
status
sort_order
```

### Voucher
Voucher product/campaign.

```text
id
partner_id
category_id
name
slug
description
image_url
original_price
sale_price
discount_percent
terms
refund_policy
quantity_total
quantity_sold
quantity_available
sale_start_at
sale_end_at
valid_from
valid_to
status
rejection_reason
created_at
updated_at
```

### VoucherBranch
Many-to-many relation between voucher and branch.

```text
voucher_id
branch_id
```

### Cart and CartItem

```text
carts: id, user_id, status, created_at, updated_at
cart_items: id, cart_id, voucher_id, quantity, unit_price, created_at, updated_at
```

### Order

```text
id
order_number
user_id
status
payment_status
subtotal
discount_total
total_amount
buyer_name
buyer_email
buyer_phone
recipient_name
recipient_email
recipient_phone
idempotency_key
created_at
updated_at
```

### OrderItem

```text
id
order_id
voucher_id
quantity
unit_price
total_price
created_at
```

### Payment

```text
id
order_id
method
status
amount
transaction_ref
paid_at
refunded_at
created_at
updated_at
```

### VoucherCode
Issued code after successful payment.

```text
id
code
voucher_id
order_id
order_item_id
owner_user_id
status
issued_at
expires_at
used_at
locked_reason
created_at
updated_at
```

### VoucherUsageLog
Operational log for actual voucher use.

```text
id
voucher_code_id
partner_id
branch_id
redeemed_by_user_id
redeemed_at
note
created_at
```

### Review

```text
id
user_id
voucher_id
order_id
rating
comment
status
created_at
updated_at
```

### AuditLog
System traceability log.

```text
id
actor_id
actor_role
action
target_type
target_id
old_value_json
new_value_json
ip_address
user_agent
created_at
```

### CMS tables
Optional but useful for admin content management:

```text
banners
cms_pages
```

## 3. Required relationships

```text
User 1 - 0/1 Partner
Partner 1 - n Branch
Partner 1 - n Voucher
Category 1 - n Voucher
Voucher n - n Branch
User 1 - 1 active Cart
Cart 1 - n CartItem
User 1 - n Order
Order 1 - n OrderItem
Order 1 - 1 Payment
Voucher 1 - n OrderItem
OrderItem 1 - n VoucherCode
VoucherCode 1 - 0/1 VoucherUsageLog
User 1 - n Review
Voucher 1 - n Review
User 1 - n AuditLog as actor
```

## 4. Required indexes

| Table | Index | Purpose |
|---|---|---|
| users | unique(email) | Prevent duplicate account |
| users | role, status | Admin filter |
| partners | user_id unique | One partner profile per partner user |
| vouchers | status, sale_start_at, sale_end_at | Catalog query |
| vouchers | category_id, status | Filter by category |
| vouchers | partner_id, status | Partner management |
| voucher_codes | code unique | Prevent duplicate code |
| voucher_codes | owner_user_id, status | My vouchers page |
| voucher_codes | voucher_id, status | Report/usage count |
| orders | user_id, status | Order history |
| orders | order_number unique | Lookup |
| audit_logs | actor_id, created_at | Trace actor |
| audit_logs | action, created_at | Admin audit filter |

## 5. Data consistency rules

- `quantity_available = quantity_total - quantity_sold` or keep as stored field updated transactionally.
- `quantity_sold` must never exceed `quantity_total`.
- `voucher_codes.code` must be unique.
- `voucher_code.status = used` implies `used_at` is not null.
- `payment.status = success` is required before code issuance.
- `order.status = cancelled` must not have newly issued codes.

## 6. Data sample requirements

Minimum seed data:

- 1 admin.
- 3 customers.
- 2 partners.
- 4 branches.
- 7 categories.
- 8 vouchers with mixed statuses.
- 5 orders.
- 10 voucher codes with mixed statuses.
- Audit logs for approval, checkout, redeem.
