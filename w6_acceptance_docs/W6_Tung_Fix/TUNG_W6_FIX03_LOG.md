# TASK=TUNG-W6-FIX-03

PR_URL=https://github.com/rtyud5/ViVouch/pull/165
TESTED_SHA=bf2681de58925f772d55afcbf1f54817bdaa0abc
TEST_FILE=backend/tests/refund-concurrency-dedicated.test.js  
POSTGRES_VERSION=16  
REF_CON_01=PASS  
REF_CON_02=PASS  
REF_CON_03=PASS  
REF_CON_04=PASS  
FULL_BACKEND_SUITE=PASS  
DOUBLE_REFUND=0  
INVALID_FINAL_STATE=0  
REMAINING_RISK=none  


## Chi tiết các Assertions đã được xác nhận thành công trong DB:

- REF-CON-01 (Hai Customer refund requests đồng thời): Xác nhận chỉ 1 record RefundRequest được tạo với trạng thái REQUESTED, trạng thái Order chuyển sang REFUND_PENDING, ví tiền của Customer chưa bị hoàn/ghi có (giữ nguyên sau trừ thanh toán ban đầu), và chỉ có đúng 1 record audit log ghi nhận hành động CUSTOMER_REQUEST_REFUND. Request thất bại (loser) nhận về mã lỗi hợp lệ của hệ thống (ORDER_NOT_REFUNDABLE hoặc REFUND_ALREADY_EXISTS / P2002).
- REF-CON-02 (Hai Admin approve đồng thời): Xác nhận chỉ có 1 Admin duy nhất thực hiện Approve thành công. Wallet được hoàn đúng số tiền bán của Voucher 1 lần duy nhất, tạo ra đúng 1 dòng giao dịch ví loại REFUND (ràng buộc unique [orderId, type] ở tầng DB đã ngăn chặn mọi mutation lặp lại của transaction loser), trạng thái Order/Payment/VoucherCode cập nhật thành REFUNDED chính xác một lần, đồng thời bắn duy nhất 1 Notification REFUND_RESOLVED và ghi nhận đúng 1 Audit log ADMIN_APPROVE_REFUND.
- REF-CON-03 (Approve và redeem cạnh tranh): Xác nhận khi một Refund request đang ở trạng thái pending, VoucherCode chuyển sang trạng thái bảo vệ REFUND_PENDING. Trình xác thực (redeemCode) sẽ ngay lập tức chặn thao tác Staff redeem và trả về lỗi VOUCHER_CODE_REFUND_PENDING. Trạng thái cuối của VoucherCode là REFUNDED (sau khi approve xong), không bao giờ rơi vào trạng thái bất hợp lệ (vừa redeemed vừa refunded) và không phát sinh bất kỳ dòng log VoucherUsageLog nào.
- REF-CON-04 (Client retry và idempotency): Giả lập cả hai tình huống retry tuần tự và song song đồng thời bằng Promise.allSettled. Kết quả chỉ duy nhất 1 RefundRequest được ghi nhận tại DB, trạng thái Order chuyển sang REFUND_PENDING ổn định, và audit logs không phát sinh thêm bản ghi dư thừa.

## Lệnh

```
 npx vitest run tests/refund-concurrency-dedicated.test.js --reporter=verbose 2>&1

 ✓ tests/refund-concurrency-dedicated.test.js > REF-CON-01: Concurrent customer refund requests on same order > exactly one RefundRequest is created; no double wallet credit; voucher stays REFUND_PENDING 88ms
 ✓ tests/refund-concurrency-dedicated.test.js > REF-CON-02: Concurrent admin approvals of the same refund request > only one admin wins; wallet credited once; WalletTransaction unique constraint holds; payment REFUNDED once 95ms
 ✓ tests/refund-concurrency-dedicated.test.js > REF-CON-03: Approve-refund vs redeem racing on same voucher code > redeem is blocked; final state never USED; no usage log created 58ms
 ✓ tests/refund-concurrency-dedicated.test.js > REF-CON-04: Client retry does not create duplicate refund > sequential retries produce exactly one RefundRequest with stable state 55ms
 ✓ tests/refund-concurrency-dedicated.test.js > REF-CON-04: Client retry does not create duplicate refund > concurrent retries (Promise.allSettled) produce exactly one RefundRequest 126ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  16:29:11
   Duration  2.08s (transform 173ms, setup 0ms, import 504ms, tests 1.39s, environment 0ms)
```
