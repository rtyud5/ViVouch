# TASK=TUNG-W6-FIX-04 — Master Retained Evidence Log

**TESTED_SHA:** `1797f5c907a012cf109c95d97fefdfca5a7bb2e7`  
**BRANCH:** `tung/w6-fix-04-retained-evidence`  
**DATE:** `2026-08-07`  

---

## Báo cáo Bàn giao Handoff Block

```text
TASK=TUNG-W6-FIX-04
TESTED_SHA=1797f5c907a012cf109c95d97fefdfca5a7bb2e7
OPS_01=w6_acceptance_docs/W6_Tung_Fix/OPS_01_PARTNER_APPLY_ADMIN_APPROVAL.md
OPS_02=w6_acceptance_docs/W6_Tung_Fix/OPS_02_STAFF_BRANCH_SCOPE.md
OPS_03=w6_acceptance_docs/W6_Tung_Fix/OPS_03_REDEEM_INTEGRITY.md
OPS_04=w6_acceptance_docs/W6_Tung_Fix/OPS_04_ADMIN_REFUND_TICKET.md
OPS_05=w6_acceptance_docs/W6_Tung_Fix/OPS_05_AUDIT_TRAIL_SECURITY.md
OPS_06=w6_acceptance_docs/W6_Tung_Fix/OPS_06_COMMISSION_REPORT.md
PRIVILEGE_BYPASS=0
BRANCH_BYPASS=0
DUPLICATE_REDEEM=0
REPORT_RECONCILIATION=PASS
SECRET_PII_REVIEW=PASS
REMAINING_RISK=none
```

---

## Tóm tắt nội dung Evidence đã bổ sung

1. **OPS-01 — Partner apply và Admin approval:**
   - Đã kiểm chứng quy trình đăng ký Partner (`PENDING`), Admin duyệt (`APPROVED`) hoặc từ chối (`REJECTED`).
   - Khóa tuyệt đối API/URL trực tiếp của Partner ở trạng thái `PENDING`/`REJECTED`.
   - Refetch cache role/status của người dùng ngay sau thay đổi.

2. **OPS-02 — Owner tạo/deactivate Staff và branch scope:**
   - Phân quyền Owner gán branch cho Staff.
   - Staff bị giới hạn phạm vi chi nhánh; mọi thao tác khác branch bị chặn trả về `403 INVALID_BRANCH_SCOPE` mà không mutate DB.
   - Staff bị deactivate lập tức bị thu hồi quyền truy cập API.

3. **OPS-03 — Redeem:**
   - Redeem đúng branch thành công 1 lần dưới transaction + row-level locking (`SELECT FOR UPDATE`).
   - Redeem sai branch/trùng lặp/hết hạn/đã hoàn tiền/đang chờ hoàn tiền đều bị ngăn chặn an toàn ở DB.
   - UI hiển thị lỗi chính xác từ backend, không báo thành công giả.

4. **OPS-04 — Admin refund và ticket:**
   - Giao diện Admin hiển thị status badge đồng nhất.
   - payOS VietQR manual refund được phân biệt rõ ràng với hoán tiền ví tự động, yêu cầu Admin nhập mã đối soát ngân hàng (`providerRefundReference`).
   - Ghi nhận `requestId` an toàn cho truy vết.

5. **OPS-05 — Audit:**
   - Ghi log audit cho toàn bộ critical actions (approve partner, staff create/deactivate, redeem, refund, ticket).
   - Đầy đủ thông tin `actor`, `action`, `target`, `requestId`, `branchId`.
   - Mọi thông tin nhạy cảm (PII/Secret/Raw voucher code) đều được che/redact an toàn.

6. **OPS-06 — Commission report validation:**
   - Khớp nối chính xác 4 chỉ số: Doanh thu Gross, Tỷ lệ phí nền tảng %, Phí nền tảng ước tính, Doanh thu Partner ước tính.
   - Định dạng đơn vị tiền tệ VND (`₫`) và % rõ ràng. Chỉ Owner Partner tương ứng mới có quyền xem.
   - Đính kèm wording mô phỏng rõ ràng (*"Các số tiền chỉ là ước tính/mô phỏng, không phải payout thực tế"*).
