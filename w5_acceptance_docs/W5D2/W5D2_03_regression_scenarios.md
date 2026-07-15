# W5-D2 — Regression Scenarios cho Invalid Roles & Status

**Lead:** Duy (Acceptance & Security Lead)

Bộ kiểm tra sau đây nhằm đóng vai trò làm tài liệu hướng dẫn đầu vào cho H3 (Tự động hóa Test) để đảm bảo không bị Regress các quy tắc Auth / Business Guard đã được chốt.

## Nhóm 1: Scenarios về Role Guards & Cố tình sai Role
*Mục tiêu: Đảm bảo Client gửi JWT nhầm Role phải bị chặn lập tức bằng 403.*

| Scenario ID | Test Steps | Expected API Result |
|:---:|:---|:---|
| **RS-ROL-01** | Tạo JWT giả của `CUSTOMER`, gọi vào API Admin `GET /api/admin/dashboard`. | `403 FORBIDDEN` |
| **RS-ROL-02** | Tạo JWT của `PARTNER`, gọi vào `POST /api/customer/orders/checkout`. | `403 FORBIDDEN` |
| **RS-ROL-03** | Tạo JWT của `ADMIN`, cố tình thao tác giả với `PUT /api/partner/profile` | `403 FORBIDDEN` |

## Nhóm 2: Scenarios về Account Lifecycle (Locked/Suspended)
*Mục tiêu: Đảm bảo khi User/Partner bị Admin trừng phạt (Block), mọi tác động nghiệp vụ phải dừng ngay cả khi token chưa hết hạn.*

| Scenario ID | Test Steps | Expected API Result |
|:---:|:---|:---|
| **RS-LC-01** | JWT của Customer A (Hợp lệ). Dùng Admin đổi `Customer A` sang Status `LOCKED`. Customer A ấn "Add to cart". | `403 ACCOUNT_LOCKED` |
| **RS-LC-02** | JWT của Partner B (Hợp lệ). Dùng Admin đổi `Partner B` sang Status `REJECTED/BANNED`. Partner B gọi các API Partner. | `403 PARTNER_NOT_ACTIVE` (khi CRUD voucher) <br/> `403 FORBIDDEN` (khi đối soát redeem mã) |
| **RS-LC-03** | JWT Customer bị `LOCKED`. Customer gọi API `GET /api/users/me` để lấy thông tin. | `403 ACCOUNT_LOCKED` (Bởi AuthMiddleware) |

## Nhóm 3: Scenarios về Boundary của Voucher Status Cycle
*Mục tiêu: Chặn tình trạng chuyển Status sai tuần tự hoặc sửa data ngoài luồng.*

| Scenario ID | Test Steps | Expected API Result |
|:---:|:---|:---|
| **RS-VC-01** | ID Voucher đang `ON_SALE`. Partner gọi `POST /api/partner/vouchers/:id/submit` để Submit lại. | `400 INVALID_STATUS_TRANSITION` |
| **RS-VC-02** | ID Voucher đang `ON_SALE` nhưng Set giá bán `salePrice` cao hơn cả `originalPrice` qua hàm Update. | `400 INVALID_PRICE` |
| **RS-VC-03** | Hết hạn giờ mua `saleEnd` (Set saleEnd trong quá khứ). Customer lấy mã Voucher bắn vào `/cart/items`. | (Không hiện ở /vouchers filter) / Checkout sẽ Validation Error `400`. Voucher `OUT_OF_STOCK` hoặc hết hạn. |

## Nhóm 4: Scenarios về Boundary Redemption & Usage
*Mục tiêu: Validation Cross-Tenants khi Redeem Mã của Partner này nộp vào Partner khác.*

| Scenario ID | Test Steps | Expected API Result |
|:---:|:---|:---|
| **RS-RD-01** | Partner A lấy Mã Code QR của Partner B để Scan và bắn lên `/api/partner/redeem` (đây là endpoint hợp nhất cho cả check và confirm thực tế). | `403 FORBIDDEN - Không có quyền xác thực mã này` |
| **RS-RD-02** | Partner A Scan Mã của mình nhưng sử dụng chi nhánh (B) Không đăng ký cho Voucher đó. | `403 INVALID_BRANCH_SCOPE` |
| **RS-RD-03** | Partner Scan Mã 2 lần liên tục với cùng 1 Voucher Code. Lần 1 thành công. | Lần 1: `200` <br/> Lần 2: `400 VOUCHER_CODE_USED` |
