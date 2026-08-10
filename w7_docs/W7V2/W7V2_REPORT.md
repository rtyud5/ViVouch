# Báo Cáo W7-V2 - Customer Canonical E2E + BRD Closure

**Dự án:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-V2  
**Vai trò:** Customer E2E Lead  
**Trạng thái:** PASS

## Kết quả

- Đã rà soát lại tài liệu W6 và W7 trước khi chạy xác nhận.
- Đã verify luồng customer cốt lõi ở frontend: bộ lọc, gift recipient, voucher QR/trạng thái.
- Đã chạy lại isolated backend runner với PostgreSQL test container và bộ env payOS giả.
- Frontend Vitest pass.
- Frontend production build pass.
- Backend isolated E2E suite pass.
- Không cần sửa logic code cho task này.

## Tài liệu đã đọc

- [README.md](/../../README.md)
- [docs/11_w6_w7_marketplace/README.md](/../../docs/11_w6_w7_marketplace/README.md)
- [docs/11_w6_w7_marketplace/01_architecture_and_flows.md](/../../docs/11_w6_w7_marketplace/01_architecture_and_flows.md)
- [docs/11_w6_w7_marketplace/02_permissions_and_states.md](/../../docs/11_w6_w7_marketplace/02_permissions_and_states.md)
- [docs/11_w6_w7_marketplace/05_test_release_runbook.md](/../../docs/11_w6_w7_marketplace/05_test_release_runbook.md)
- [w7_docs/W7D1/W7_D1_RELEASE_POLICY.md](/../../w7_docs/W7D1/W7_D1_RELEASE_POLICY.md)
- [w7_docs/W7D2/W7_D2_BRD_CLOSURE.md](/../../w7_docs/W7D2/W7_D2_BRD_CLOSURE.md)
- [w7_docs/W7V1/W7V1_REPORT.md](/../../w7_docs/W7V1/W7V1_REPORT.md)

## Evidence đã xác nhận

### Frontend

- `buildVoucherQueryParams` map đúng `keyword`, `category`, `city`, `partner`, `price`, `discount`, `sort`.
- `VoucherFilter` nối đúng bộ lọc public voucher list.
- `CheckoutPage` chỉ lưu gift recipient khi bật chế độ quà tặng, và checkout thường vẫn chạy khi tắt.
- `OrdersPage` hiển thị đúng `recipientName`, `recipientPhone`, `note` khi có dữ liệu.
- `OrderSuccessPage`, `MyVouchersPage`, `QRCodeModal`, `VoucherCodeCard` hiển thị đúng voucher code/QR/state sau thanh toán thành công.

### Backend / BRD

- Public voucher query đã khóa về `ON_SALE` và partner `APPROVED`.
- Duplicate webhook, idempotent checkout, retry, và chống duplicate issuance/redeem đã có proof trong suite backend.
- Isolated runner đã được rerun thành công với PostgreSQL container test.

## Trạng thái tiêu chí

| Tiêu chí | Trạng thái | Ghi chú |
|---|---:|---|
| Filters keyword/category/area/price/discount/partner/status pass | PASS | `status` được khóa ở backend public catalog là `ON_SALE` |
| Gift recipient lưu/hiển thị đúng khi có và checkout thường vẫn chạy khi không có | PASS | Đã xác nhận qua luồng checkout và orders UI |
| Voucher code/QR/state đúng sau payment success | PASS | Đã xác nhận qua success page, my vouchers, và QR modal |
| Retry không tạo duplicate | PASS | Đã xác nhận lại qua backend isolated suite |

## Lệnh đã chạy

### Frontend

```bash
node node_modules/vitest/vitest.mjs --run
node node_modules/vite/bin/vite.js build
```

### Backend isolated runner

```powershell
$env:PAYOS_CLIENT_ID='test-client'
$env:PAYOS_API_KEY='test-api-key'
$env:PAYOS_CHECKSUM_KEY='test-checksum-key'
node scripts/run-e2e.mjs "node backend/node_modules/vitest/vitest.mjs --run backend/tests/checkout-api.test.js backend/tests/payos-webhook.test.js backend/tests/reviews-api.test.js backend/tests/refund-concurrency-dedicated.test.js backend/tests/rbac-authorization.test.js"
```

## Kết quả chạy backend

- `5/5` test files pass
- `33/33` tests pass
- PostgreSQL test container, migration, seed, backend server, frontend dev server và E2E command đều pass

## File thay đổi

- Thêm: `w7_docs/W7V2/W7V2_REPORT.md`

## Ghi chú bảo mật

- Report này không ghi hostname, username, đường dẫn nội bộ nhạy cảm, token, hay secret.
- Các giá trị payOS dùng trong runner chỉ là dummy env cho test, không phải thông tin thật.

## Kết luận

W7-V2 đã hoàn tất theo phạm vi khóa của dự án:

- Customer canonical flow đã được verify.
- BRD closure cho filter, gift recipient, voucher QR/state đã có evidence.
- Retry / duplicate protection đã được re-check.
- Không phát sinh code change ngoài report.
