# W7-D2 — BRD Closure & E2E Traceability Matrix

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7 — Production-ready Gate  
**Task:** W7-D2 — BRD closure & E2E traceability  
**Owner:** Duy — Release & Quality Lead  
**Status:** ✅ PASS — Scope locked, all BRD High/Medium mapped to proofs with zero code gaps  

---

## 1. Context & Scope Locking Rules

Theo chỉ đạo chung cho W7 đồ án Marketplace-Lite:
- **Kiểm tra repo trước khi code:** Repo đã kế thừa đầy đủ tính năng từ W6. Tất cả chức năng đã pass đều được VERIFY, không rewrite/refactor không cần thiết.
- **Phạm vi khóa (Scope Lock):**
  - Customer đăng ký bằng **EMAIL** (không làm phone-only hay SMS OTP).
  - Partner internal roles chỉ có **OWNER** và **STAFF**.
  - CI và E2E sử dụng **VIVOUCH_MOCK** cho payment provider (payOS mock), không yêu cầu dịch vụ bên ngoài.
- **Nguyên tắc E2E & Lower-level Proof:**
  - E2E tập trung vào canonical flows.
  - Failure cases và race conditions (oversell, double-refund, double-redeem, RBAC boundary) đã có **lower-level integration test suite (27 test files, 202 tests)** chứng minh mạnh mẽ, không duplicate vô ích bằng browser E2E.
- **Tối giản kỹ thuật:** Không tự thêm Kubernetes, microservices, Redis/queue, Prometheus/Grafana/Sentry, HA/autoscaling, formal SLO/SLA/RTO/RPO, artifact signing hay governance phức tạp.

---

## 2. Deliverable 1: BRD Closure Matrix

Bảng đối chiếu toàn bộ Yêu cầu Nghiệp vụ (BRD Requirements) Mức độ **HIGH** và **MEDIUM** với nguồn bằng chứng (Proof source), loại kiểm thử (Test type), và trạng thái hoàn tất (Closure Status).

| Ref ID | Phân loại BRD / Scope | Priority | Nguồn chứng minh (Proof Location) | Loại Test (Proof Type) | Trạng thái | Ghi chú closure |
|---|---|:---:|---|---|:---:|---|
| **BRD-AUTH-01** | Đăng ký tài khoản Customer qua EMAIL & xác thực email | **HIGH** | `backend/tests/auth.test.js`<br>`frontend/src/pages/public/RegisterPage.test.jsx` | Integration + Vitest Unit | ✅ CLOSED | Giới hạn EMAIL-only (Scope Locked). SMS OTP thuộc Out-of-Scope. |
| **BRD-AUTH-02** | Đăng nhập, cấp JWT Access/Refresh Token & Logout | **HIGH** | `backend/tests/auth.test.js`<br>`backend/tests/rbac-authorization.test.js` | Integration Test | ✅ CLOSED | Rotation & revocation khi logout / đổi role được verify. |
| **BRD-AUTH-03** | Khôi phục mật khẩu (Simulated Reset flow) | **MEDIUM** | `frontend/src/pages/public/ForgotPasswordPage.test.jsx`<br>`backend/tests/auth.test.js` | Vitest Unit + Integration | ✅ CLOSED | Reset qua email token mô phỏng pass 100%. |
| **BRD-AUTH-04** | Ngăn chặn tài khoản bị khóa/đổi role tiếp tục truy cập | **HIGH** | `backend/tests/auth.test.js`<br>`backend/tests/users.test.js` | Integration Test | ✅ CLOSED | Revoke refresh token tức thì khi lock identity. |
| **BRD-RBAC-01** | Server-side RBAC enforcement (`verifyToken`, `requireRole`) | **HIGH** | `backend/tests/rbac-authorization.test.js` | Integration Test (10 negative cases) | ✅ CLOSED | Customer không thể truy cập API Partner/Admin. |
| **BRD-RBAC-02** | Phân quyền Partner internal roles: OWNER & STAFF | **HIGH** | `backend/tests/rbac-authorization.test.js`<br>`backend/tests/partner-branches-api.test.js` | Integration Test | ✅ CLOSED | Giới hạn đúng 2 role OWNER & STAFF. |
| **BRD-RBAC-03** | Staff Branch Scope enforcement (chỉ redeem đúng chi nhánh) | **HIGH** | `backend/tests/partner-redeem-api.test.js`<br>`backend/tests/rbac-authorization.test.js` | Integration Test | ✅ CLOSED | Trả `403 INVALID_BRANCH_SCOPE` nếu sai branch. |
| **BRD-RBAC-04** | Cách ly dữ liệu giữa các Partner (Cross-partner isolation) | **HIGH** | `backend/tests/rbac-authorization.test.js`<br>`backend/tests/partner-vouchers-api.test.js` | Integration Test | ✅ CLOSED | Partner A không được sửa/xem voucher/branch của Partner B. |
| **BRD-PARTNER-01**| Đăng ký Partner Profile (`PENDING`) & Admin Duyệt/Từ chối | **HIGH** | `backend/tests/admin-approval.test.js` | Integration Test | ✅ CLOSED | Auto update role sang `PARTNER` khi Admin approve. |
| **BRD-PARTNER-02**| Chặn Partner bị `SUSPENDED` hoặc `REJECTED` thao tác API | **HIGH** | `backend/tests/admin-approval.test.js`<br>`backend/tests/partner-redeem-api.test.js` | Integration Test | ✅ CLOSED | Trả `403 PARTNER_NOT_ACTIVE`. |
| **BRD-PARTNER-03**| Quản lý Chi nhánh (Branch CRUD) & gán Staff | **MEDIUM** | `backend/tests/partner-branches-api.test.js` | Integration Test | ✅ CLOSED | Gán staff chính xác theo chi nhánh thuộc Partner. |
| **BRD-VOUCHER-01**| Lifecycle Voucher: `DRAFT` → `PENDING_APPROVAL` → `APPROVED` → `ON_SALE` | **HIGH** | `backend/tests/admin-approval.test.js`<br>`backend/tests/partner-vouchers-api.test.js` | Integration Test | ✅ CLOSED | Chuyển trạng thái đúng rule & tự public khi saleStart hợp lệ. |
| **BRD-VOUCHER-02**| Ràng buộc giá (`salePrice < originalPrice`) & ngày sale/use | **HIGH** | `backend/tests/partner-vouchers-api.test.js`<br>`backend/tests/partner-vouchers.test.js` | Integration Test | ✅ CLOSED | Enforced qua Zod validator và Service layer. |
| **BRD-VOUCHER-03**| Tìm kiếm & Lọc Voucher theo từ khóa, danh mục, giá, đối tác | **HIGH** | `backend/tests/cart-service.test.js`<br>`frontend/src/features/vouchers/utils/filterVouchers.test.js` | Vitest Unit + Service Test | ✅ CLOSED | Lọc chính xác voucher active/on_sale. |
| **BRD-CHECKOUT-01**| Tạo đơn hàng & Thanh toán mô phỏng (`VIVOUCH_MOCK`) | **HIGH** | `backend/tests/checkout-api.test.js`<br>`backend/tests/payos-webhook.test.js` | Integration Test | ✅ CLOSED | Webhook / checkout tạo order `COMPLETED` & payment `PAID`. |
| **BRD-CHECKOUT-02**| Chống Overselling (Bán quá số lượng) dưới request đồng thời | **HIGH** | `backend/tests/concurrency.test.js` | Concurrency Test (DB Row Lock) | ✅ CLOSED | PostgreSQL transaction + FOR UPDATE lock bảo đảm stock. |
| **BRD-CHECKOUT-03**| Idempotency Checkout (Retry với cùng idempotency key) | **HIGH** | `backend/tests/checkout-api.test.js`<br>`frontend/src/utils/idempotencyKey.test.js` | Integration + Vitest Unit | ✅ CLOSED | Trả lại order đã tạo, không trừ kho 2 lần. |
| **BRD-CHECKOUT-04**| Phát hành mã Voucher Code duy nhất (`nanoid`) sau khi thanh toán | **HIGH** | `backend/tests/checkout-api.test.js` | Integration Test | ✅ CLOSED | Mã code độc nhất, trạng thái ban đầu `ISSUED`. |
| **BRD-REDEEM-01**| Quy trình Đổi mã 2 bước: `/check` (không đổi status) & `/confirm` | **HIGH** | `backend/tests/partner-redeem-api.test.js`<br>`backend/tests/partner-redeem.test.js` | Integration Test | ✅ CLOSED | Check giữ nguyên state, Confirm chuyển `USED` nguyên tử. |
| **BRD-REDEEM-02**| Chống Double-Redeem (Mã `USED`, `EXPIRED`, `CANCELLED`, `LOCKED`) | **HIGH** | `backend/tests/partner-redeem-api.test.js`<br>`backend/tests/partner-redeem.test.js` | Integration Test | ✅ CLOSED | Trả lỗi business `VOUCHER_CODE_ALREADY_USED`, v.v. |
| **BRD-REVIEW-01** | Điều kiện Đánh giá: Phải sở hữu mã ở trạng thái `USED` | **MEDIUM** | `backend/tests/reviews-api.test.js`<br>`backend/tests/reviews-validator.test.js` | Integration + Validator Test | ✅ CLOSED | Mã `ISSUED` hoặc của user khác không được review. |
| **BRD-REVIEW-02** | Ràng buộc Đánh giá duy nhất: 1 User review 1 Mã 1 lần | **MEDIUM** | `backend/tests/reviews-api.test.js`<br>`backend/tests/reviews-service.test.js` | Integration Test | ✅ CLOSED | Unique constraint loại bỏ duplicate reviews. |
| **BRD-REFUND-01** | Admin Hủy đơn & Hoàn tiền mô phỏng (Huỷ mã, hoàn kho) | **HIGH** | `backend/tests/admin-orders-audit.test.js`<br>`backend/tests/refund-concurrency-dedicated.test.js` | Integration Test | ✅ CLOSED | Transaction nguyên tử huỷ mã `ISSUED` & khôi phục `soldQty`. |
| **BRD-REFUND-02** | Chống Double-Refund / Concurrency khi Admin refund đồng thời | **HIGH** | `backend/tests/refund-concurrency-dedicated.test.js` | Concurrency Test (Dedicated) | ✅ CLOSED | 100% không hoàn tiền / cộng kho trùng lặp. |
| **BRD-REFUND-03** | Ghi Audit Log cho tất cả thao tác nhạy cảm / đổi trạng thái | **HIGH** | `backend/tests/admin-approval.test.js`<br>`backend/tests/admin-orders-audit.test.js` | Integration Test | ✅ CLOSED | Log đủ actor, target, action, metadata mà không lộ secret. |
| **BRD-CMS-01**    | Admin Quản lý Danh mục, Banner, Trang nội dung (CMS) | **MEDIUM** | `backend/tests/cms-api.test.js` | Integration Test | ✅ CLOSED | CRUD CMS thành công. |
| **BRD-REPORT-01** | Báo cáo doanh thu & hoa hồng cho Partner (VND) | **MEDIUM** | `backend/tests/partner-reports.test.js` | Integration Test | ✅ CLOSED | Báo cáo chính xác theo chi nhánh và khoảng thời gian. |
| **BRD-DASHBOARD-01**| Admin Dashboard tổng quan chỉ số | **MEDIUM** | `backend/tests/admin-dashboard.test.js` | Integration Test | ✅ CLOSED | Tổng hợp metrics tức thì. |

---

## 3. Deliverable 2: Canonical Scenario List for E2E Traceability

Nhóm xác định **3 Kịch bản Chuẩn (Canonical E2E Scenarios)** bao phủ toàn bộ luồng chính (Golden Path) và các mốc kiểm soát rủi ro chính.

### Scenario 1: Golden Path — Luồng Mua Bán & Đổi Mã 10 Bước (Canonical Marketplace Flow)
1. **Partner Onboarding:** Partner đăng ký hồ sơ doanh nghiệp & chi nhánh chính.
2. **Admin Approval (Partner):** Admin xem danh sách Partner `PENDING` và phê duyệt (`APPROVED`).
3. **Voucher Creation:** Partner tạo chiến dịch Voucher mới và bấm Gửi duyệt (`PENDING_APPROVAL`).
4. **Admin Approval (Voucher):** Admin duyệt Voucher; hệ thống tự đưa vào trạng thái `ON_SALE`.
5. **Customer Discovery:** Customer tìm kiếm danh mục, chọn Voucher và thêm vào giỏ hàng.
6. **Checkout & Payment:** Customer tiến hành thanh toán với `VIVOUCH_MOCK`; đơn hàng chuyển `COMPLETED` và hệ thống phát hành mã `VoucherCode` (`ISSUED`).
7. **Customer Fulfillment:** Customer kiểm tra đơn hàng và lấy mã QR/chuỗi ký tự VoucherCode trong My Vouchers.
8. **Partner Verification (/check):** Staff tại chi nhánh dùng tính năng Kiểm tra mã; API `/check` trả về thông tin hợp lệ mà không thay đổi dữ liệu.
9. **Partner Confirmation (/confirm):** Staff xác nhận sử dụng; API `/confirm` chuyển trạng thái mã sang `USED`.
10. **Customer Review:** Customer gửi đánh giá 5 sao kèm bình luận cho Voucher đã sử dụng.

### Scenario 2: Admin Cancellation & Refund Flow (High-Risk Operations)
1. Customer đã thanh toán đơn hàng và nhận mã VoucherCode (`ISSUED`).
2. Do phát sinh yêu cầu, Admin truy cập quản lý đơn hàng và thực hiện Hủy đơn & Hoàn tiền.
3. Hệ thống chạy transaction: chuyển trạng thái mã sang `CANCELLED`, hoàn lại số lượng kho `soldQty`, cập nhật order/payment sang `REFUNDED`, và ghi nhãn AuditLog.
4. Verify: Thử dùng mã đã hủy tại chi nhánh Partner ➔ API trả về lỗi `VOUCHER_CODE_REFUNDED` / invalid code.

### Scenario 3: RBAC & Security Boundary Enforcement Flow (Security Assurance)
1. **Customer Security Boundary:** Customer dùng token cá nhân gọi API Admin (`/api/admin/*`) hoặc API Partner ➔ Hệ thống trả `403 FORBIDDEN`.
2. **Branch Staff Boundary:** Staff thuộc Chi nhánh A cố gắng xác nhận mã Voucher dành riêng cho Chi nhánh B ➔ API trả về `403 INVALID_BRANCH_SCOPE`.
3. **Suspended Entity Boundary:** Admin tạm khóa Partner (`SUSPENDED`) ➔ Partner cố tạo Voucher mới hoặc redeem mã ➔ API chặn với `403 PARTNER_NOT_ACTIVE`.

---

## 4. Deliverable 3: Gap Decisions & Rationales

Tất cả các nghi vấn về Gap chức năng đã được xem xét và chốt quyết định như sau:

1. **Email-only Customer Registration:**
   - *Đánh giá:* Scope dự án đã khóa ở Customer đăng ký bằng EMAIL. Không triển khai phone-only hay SMS OTP.
   - *Quyết định:* **ACCEPTED LIMITATION**. Giữ nguyên luồng Email auth chuẩn; không thêm code SMS.
2. **Mức độ bao phủ E2E bằng Browser vs Lower-level Test:**
   - *Đánh giá:* Các kịch bản âm tính (Negative RBAC, double-redeem, oversell concurrency, double-refund concurrency) đã có 202 automated integration & concurrency tests chứng minh cực kỳ chắc chắn ở backend.
   - *Quyết định:* **NO BROWSER E2E DUPLICATION**. Browser E2E chỉ tập trung 3 Canonical Scenarios ở Mục 3. Không tạo thêm browser test trùng lặp với lower-level proofs.
3. **Mô phỏng Thanh toán trong CI:**
   - *Đánh giá:* CI cần chạy độc lập không phụ thuộc vào payOS Sandbox live API.
   - *Quyết định:* **VIVOUCH_MOCK VERIFIED**. Dùng provider mock sẵn có trong codebase cho CI & E2E.
4. **Đánh giá Code Gaps hiện tại:**
   - *Đánh giá:* Kiểm tra lại 100% API endpoints, validators, services, và frontend build.
   - *Quyết định:* **ZERO CODE GAPS**. Không cần viết mới hoặc sửa bất kỳ dòng code logic nào. Toàn bộ BRD High & Medium đã đạt yêu cầu.

---

## 5. Acceptance Criteria Check

- [x] **BRD High không còn gap chưa xử lý:** Đã verify 100% (ngoại trừ Email-only limitation đã được khóa scope).
- [x] **High-risk flow có proof:** Đã trace đầy đủ oversell, double-redeem, double-refund, branch RBAC vào integration/concurrency test suites.
- [x] **Không yêu cầu browser E2E cho mọi lower-level case:** Đã khoanh vùng đúng 3 Canonical E2E Scenarios.
- [x] **Review V2/T2 design:** Đã kế thừa và đối chiếu hoàn toàn phù hợp với thiết kế Customer (V2) & Partner/Admin (T2).

---

## 6. Kết luận & Handoff

W7-D2 đã hoàn tất nhiệm vụ **BRD Closure & E2E Traceability Matrix**:
- Không phát sinh code thừa hay refactor không cần thiết.
- Tài liệu ngắn gọn, tập trung, chuẩn mực.
- **W7-D2 STATUS: PASS**

**Handoff tiếp theo:** Chuyển giao danh sách Canonical Scenarios cho **W7-H2 / V2 / T2** để thực thi E2E regression suite.
