# W5-D2 — RBAC / Status Decision Table & Error Semantics

**Baseline commit:** `e016793`
**Date:** 2026-07-15
**Lead:** Duy (Acceptance & Security Lead)

---

## 1. Authentication & Role Definitions (RBAC)

Bảng dưới đây quy định tập trung (Single Source of Truth) về kiến trúc chặn Role tại hệ thống ViVouch. Mọi API phải tuân thủ nghiêm ngặt các chuỗi Middleware tương ứng.

| Guard / Middleware | Behavior & Semantics | Http Code | Error Code | Note / Exception |
|:---|:---|:---:|:---|:---|
| **`verifyToken`** | Kiểm tra JWT tồn tại và hợp lệ định dạng. | `401` | `UNAUTHORIZED`, `TOKEN_EXPIRED`, `INVALID_TOKEN` | - |
| **`verifyToken`** (Data Validation) | Kiểm tra `user` tồn tại trong database và trạng thái. Mã lỗi trả về `403` nếu bị khóa ngang. | `403` | `ACCOUNT_LOCKED` | Nếu admin gạt khóa một user/partner, mọi session (bao gồm Refresh) sẽ lập tức bị ném 403 ở layer này, vô hiệu hóa tài khoản hoàn toàn. |
| **`requireRole('CUSTOMER')`** | Kiểm tra Role cấp độ JWT. Chặn toàn bộ Admin/Partner. | `403` | `FORBIDDEN` | Route giỏ hàng, đơn hàng, checkout. |
| **`requireRole('PARTNER')`** | Kiểm tra Role cấp độ JWT. Chặn toàn bộ Admin/Customer. | `403` | `FORBIDDEN` | Route quản lý kho voucher, chi nhánh, báo cáo. |
| **`getApprovedPartner...()`** (Business Layer Guard) | Các thao tác tạo/sửa đổi voucher và đối soát mã (redeem) yêu cầu Partner phải `APPROVED`. | `403` | `PARTNER_NOT_ACTIVE` | Thao tác thiết lập cá nhân như đổi thông tin (Profile), chỉnh sửa Branches không yêu cầu `APPROVED`. |
| **`requireRole('ADMIN')`** | Kiểm tra Role cấp độ JWT. Chặn toàn bộ Partner/Customer. | `403` | `FORBIDDEN` | Dashboard phân tích, xét duyệt Voucher, khóa User. |

*Lưu ý: ViVouch sử dụng kiến trúc Backend là Enforcement Endpoint duy nhất. Mọi Client Side Guard (`RoleRoute.jsx`) chỉ mang tính chất Routing / UX (User Experience) và tuyệt đối không đóng vai trò kiểm soát an ninh.*

---

## 2. Cross-Tenant Data Access (Ownership Check)

Các dữ liệu kinh doanh quan trọng không cho phép đọc/ghi chéo. Thất bại ném mã lỗi `403` (khi xác thực sai quyền sở hữu) hoặc `404` (không tìm thấy resource trực thuộc).

| Action | Ownership Check Strategy | Result Code |
|:---|:---|:---:|
| **Customer xem Order / Giỏ hàng** | `WHERE userId = req.user.id` trực tiếp trong Prisma Query. | `404 / Trống` |
| **Partner Get/Edit Voucher** | `WHERE partnerId = partner.id` trong Query, ném lỗi chủ động `403 FORBIDDEN` nếu cố sửa voucher của đối tác khác. | `403 / 404` |
| **Partner Redeem Voucher Code** | Kiểm tra Voucher Code truy vấn có map đúng `partnerId` không bằng JS Logic. Yêu cầu Check `BranchId` được gắn vào chiến dịch Voucher đó. | `403 FORBIDDEN` / `INVALID_BRANCH_SCOPE` |
| **Admin Read/Write** | Full Access (Không có mệnh đề ownership). Doanh thu Admin Chart gom toàn cục hệ thống. | `200 / 201` |

---

## 3. Business Logic Lifecycle & State Semantics

Các hoạt động không vi phạm quyền nhưng vi phạm luồng Nghiệp vụ (State Machine) sẽ luôn nhận mã lỗi **`400 Bad Request`** và được Frontend chuyển ngữ ra thông báo thân thiện.

| Business Trigger / Transition | Status Requirement | Failure Semantic |
|:---|:---|:---|
| Partner gửi duyệt (`submitVoucher`) | Voucher cần ở trạng thái `DRAFT` hoặc `REJECTED` | `400 INVALID_STATUS_TRANSITION` |
| Hết hạn kinh doanh (Submit muộn) | Thời gian gửi duyệt `saleEnd` phải ở tương lai | `400 SALE_PERIOD_EXPIRED` |
| Check / Cập nhật trạng thái Code (Redeem) | Voucher Code phải đang `ISSUED` | `400 VOUCHER_CODE_USED / VOUCHER_CODE_EXPIRED / VOUCHER_CODE_CANCELLED` |
| Thay đổi giá Voucher (Update) | `salePrice < originalPrice` & `soldQty <= totalQty` | `400 INVALID_PRICE / INVALID_TOTAL_QTY` |
| Thanh toán (Checkout) / Lấy Idempotency | Yêu cầu số lượng khóa (Locking) không vượt quá Inventory (`quantityAvailable`) | `400 VOUCHER_OUT_OF_STOCK / INVALID_IDEMPOTENCY_KEY` |
