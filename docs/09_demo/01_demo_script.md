# Ten-step Defense Demo

## Preparation

- Use a migrated and freshly seeded database.
- Record candidate identifier, browser version, viewport, network/console status, and start time.
- Open Customer, Partner, and Admin sessions in separate profiles.

## Script

1. Login as Admin, Partner, and Customer; show that cross-role portal access is blocked.
2. Partner opens Branches, creates/activates a branch, creates a voucher, assigns data, and submits it.
3. Admin reviews the pending voucher and approves it; show the audit record.
4. Customer finds it through category/location/price/discount/partner filters and opens detail.
5. Customer adds quantity to cart and checks out using a simulated payment method and idempotency key.
6. Show completed order, paid simulation, unique code, QR, and stock decrement.
7. Customer opens My Vouchers and shows `ISSUED` status.
8. Partner selects the branch and checks the code; show preview and verify database/UI remains `ISSUED`; explicitly confirm; show `USED`.
9. Attempt confirmation again and show `VOUCHER_CODE_USED`; customer eligibility becomes `ELIGIBLE`, then submits one review and duplicate is blocked.
10. Admin verifies dashboard/audit updates; demonstrate content management and an eligible cancellation/refund on a separate unused order.

## Evidence shots

- Public catalog filters and detail.
- Cart, checkout, order success, My Vouchers.
- Partner branches, voucher list, check preview, confirm result, second-use rejection, reports.
- Admin approval, dashboard, order cancellation/refund, CMS, and audit old/new/IP fields.
- Mobile, tablet, and desktop layouts with no console error.

## Expected outcome

The core lifecycle is traceable from requirement to UI/API/database/test. Real payment and message delivery remain visibly labeled simulations.
