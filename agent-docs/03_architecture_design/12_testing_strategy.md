# Testing Strategy

## 1. Testing scope
Focus on business-critical APIs.

## 2. Test pyramid for this project

```text
Most: service/API tests
Some: integration tests with test DB
Few: UI manual tests
```

## 3. Required API test groups

### Auth/RBAC
- Register customer.
- Login returns JWT.
- Wrong password fails.
- No token -> protected API fails.
- Customer cannot access admin API.
- Partner cannot access admin API.

### Partner/voucher
- Approved partner can create voucher draft.
- Draft can submit to pending approval.
- Invalid price fails.
- Suspended partner cannot create voucher.

### Admin approval
- Admin approves pending voucher.
- Admin rejects pending voucher with reason.
- Approval creates audit log.
- Non-admin cannot approve.

### Checkout
- Customer checks out on_sale voucher.
- Checkout creates order/payment/voucher code.
- Voucher code not created on failed payment.
- Out-of-stock checkout fails.
- Unapproved voucher checkout fails.
- Idempotency key prevents duplicate order.

### Redeem
- Partner checks issued code.
- Partner redeems issued code.
- Used code cannot be redeemed again.
- Expired code cannot be redeemed.
- Partner cannot redeem another partner's code.
- Redeem creates usage log and audit log.

### Reports
- Admin dashboard returns totals.
- Partner report only includes own data.

## 4. Manual UI test checklist

- Public voucher list loads.
- Search/filter works.
- Customer checkout flow works.
- My vouchers displays QR.
- Partner redeem page handles all result states.
- Admin dashboard loads.
- Admin approve/reject works.

## 5. Test data
Use seed data for normal demo and separate test setup for automated tests.

## 6. Commands

```bash
cd backend
npm test
```

## 7. Test naming convention

```text
should_login_customer_successfully
should_reject_customer_access_to_admin_api
should_checkout_and_issue_voucher_code
should_prevent_double_redeem
```
