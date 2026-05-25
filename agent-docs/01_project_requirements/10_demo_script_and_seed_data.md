# Demo Script and Seed Data Requirements

## 1. Demo objective
Show that the system is a real voucher e-commerce platform with business process, not just UI.

## 2. Recommended demo accounts

| Role | Email | Password | Purpose |
|---|---|---|---|
| Admin | admin@voucher.test | 123456 | Approve/manage/report |
| Partner 1 | partner.food@voucher.test | 123456 | Food partner creates voucher |
| Partner 2 | partner.beauty@voucher.test | 123456 | Beauty partner / wrong-partner test |
| Customer 1 | customer1@voucher.test | 123456 | Buy/redeem flow |
| Customer 2 | customer2@voucher.test | 123456 | Edge case/order history |

## 3. Seed categories

- Ẩm thực
- Làm đẹp
- Giải trí
- Du lịch
- Giáo dục
- Sức khỏe
- Mua sắm

## 4. Seed voucher statuses

| Voucher | Partner | Status | Purpose |
|---|---|---|---|
| Buffet Hải Sản giảm 30% | Food Partner | draft | Partner can submit |
| Cafe Combo 1+1 | Food Partner | pending_approval | Admin approval demo |
| Spa thư giãn 45 phút | Beauty Partner | approved | Can publish |
| Vé xem phim cuối tuần | Entertainment | on_sale | Customer buying demo |
| Khóa học tiếng Anh mini | Education | on_sale | Catalog variety |
| Tour city 1 ngày | Travel | expired | Expired display |
| Gym trial 7 ngày | Health | paused | Status filtering |
| Shopping voucher 100k | Shopping | rejected | Rejection reason demo |

## 5. Seed voucher codes

| Code status | Purpose |
|---|---|
| issued | Redeem success demo |
| used | Prevent reuse demo |
| expired | Prevent expired use demo |
| locked | Prevent locked use demo |
| cancelled | Cancelled order demo |

## 6. Demo path

### Step 1 — Partner creates voucher
- Login as partner.
- Go to Partner > Create Voucher.
- Enter voucher details.
- Save draft.
- Submit for approval.
- Verify status becomes `pending_approval`.

### Step 2 — Admin approves voucher
- Login as admin.
- Go to Admin > Vouchers.
- Open pending voucher.
- Approve.
- Verify audit log created.
- Verify voucher becomes visible/on_sale when valid.

### Step 3 — Customer buys voucher
- Login as customer.
- Search/filter voucher.
- Open detail.
- Add to cart.
- Checkout.
- Simulate payment success.
- Verify order is paid and voucher code is issued.
- View QR in My Vouchers.

### Step 4 — Partner redeems voucher
- Login as partner.
- Go to Redeem.
- Enter voucher code.
- Check code.
- Confirm usage.
- Verify status becomes `used`.
- Try redeeming again and verify error.

### Step 5 — Admin checks dashboard/audit
- Login as admin.
- View dashboard values.
- View audit logs for approval, checkout, issue code, redeem.

## 7. Edge cases to demonstrate if asked

- Customer cannot access admin page.
- Partner cannot redeem code of another partner.
- Voucher with 0 quantity cannot be purchased.
- Voucher expired cannot be purchased or redeemed.
- Used code cannot be redeemed again.
- Sale price greater than original price fails validation.
