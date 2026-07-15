# W5-D2 — Review các Acceptance Fixes 

**Baseline commit:** `e016793`
**Date:** 2026-07-15
**Lead:** Duy (Acceptance & Security Lead)

---

## Tổng quan Đóng Fix & Phân quyền

Quy trình W5-D2 tập trung vào việc review chéo các xử lý lỗi, gap luồng logic từ các bản vá Strong-Fix (của backend, partner, customer) bằng cách đối soát mã nguồn Backend / Controllers. Việc này cấu thành **"Bằng chứng hoàn thành Acceptance Semantics"** theo đúng yêu cầu W5-D2.

### 1. Fixes đã được Review (Backend Core / Security)

| Item Mốc W5 | Mô tả Gap / Fix đã thực hiện | Nhận xét Review W5-D2 | Verdict |
|:---:|:---|:---|:---:|
| **Hardening Auth** | Tài khoản Customer / Partner khi bị KHÓA (`status = LOCKED`) nhưng vẫn sử dụng được Token nếu chưa hết hạn JWT, hoặc vẫn fetch được refresh token. | **Fixed in Strong-fix:** `auth.middleware.js` bắt buộc join Data từ DB vào (thay vì chỉ verify Token). Token lập tức bị Reject `403 ACCOUNT_LOCKED` ở mọi route. | ✅ **PASS** |
| **Partner Isolation** | Ngăn đối tác A Validate hoặc Redeem mã Code của đối tác B (Cross-Tenant Attack). | **Fixed in Strong-fix:** Service `redeemCode` kiểm tra nghiêm ngặt sự thuộc sở hữu chéo `voucherCode.voucher.partnerId !== partner.id`. | ✅ **PASS** |
| **Voucher State Override** | Cố tình ném Payload sửa trạng thái (`status: 'APPROVED'`) vào Update API từ Partner Portal. Lách quy trình duyệt Admin. | **Fixed:** Hàm Update chỉ Update thuộc tính, lọc `status` và `partnerId`. Transition đi qua `requireRole('ADMIN')` cho Approve. | ✅ **PASS** |
| **Duplicate Checkout** | Gọi dồn dập API Checkout (Buy Now / Cart) sinh ra hàng tá mã Code vượt quá Quantity. | **Fixed in Strong-fix:** Gắn `Idempotency-Key` kết hợp Transaction. Transaction bao trọn Query Lock. | ✅ **PASS** |

### 2. Sự điều chỉnh False Alarm Bug Baseline W5-D1

| Bug ID | Mô tả Ban đầu | Phát hiện của W5-D2 (Fix Review) | Status (Sau D2) |
|:---:|:---|:---|:---:|
| **B107** | **Audit Logs Report**: W5-D1 ghi nhận BE Log API cho Audit Logs là TODO stub (`auditLog.routes.js`). Gây hoang mang về điểm NFR và BR-ADM-07. | Sau khi review sâu vào controller, **Module Audit Logs đã được tích hợp đính thẳng vào Admin Route** (`/api/admin/audit-logs`) không thông qua folder stub. Việc mapping, filter (action, targetType) đều hoạt động chuẩn xác trong `admin.service` function `findManyAuditLogs`. | ✅ **Đóng Bug B107** (Tính năng đã hoàn thiện). |
