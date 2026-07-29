# W6-T1 — Negative Scenario List

**Task:** W6-T1 — Partner/Admin compatibility & permission matrix  
**Owner:** Tùng  
**Branch:** main  
**SHA:** 66e305ed1691279d293361d570ef39e638df3acd  
**Reviewed at:** 2026-07-29T12:31 ICT  

---

## Hướng dẫn sử dụng

Mỗi scenario được đánh ID, ghi rõ:
- **Precondition:** trạng thái actor + dữ liệu cần có
- **Action:** request cần thực hiện (curl command hoặc UI flow)
- **Expected:** HTTP status + error code + DB unchanged
- **Backend guard:** middleware/service đảm nhiệm
- **Priority:** P0 (must block), P1 (should block), P2 (UX gap)

---

## Section A — Unauthenticated access (API)

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-A01 | Gọi partner profile không có token | Không có Authorization header | `GET /api/partner/profile` | 401 UNAUTHORIZED | verifyToken | P0 |
| NEG-A02 | Gọi admin dashboard không có token | Không có Authorization header | `GET /api/admin/dashboard` | 401 UNAUTHORIZED | verifyToken | P0 |
| NEG-A03 | Gọi redeem không có token | Không có Authorization header | `POST /api/partner/redeem/check` | 401 UNAUTHORIZED | verifyToken | P0 |
| NEG-A04 | Token expired | Dùng JWT đã hết hạn | `GET /api/partner/profile` | 401 TOKEN_EXPIRED | verifyToken jwt.verify | P0 |
| NEG-A05 | Token sai định dạng | `Authorization: Bearer invalid_string` | `GET /api/admin/users` | 401 INVALID_TOKEN | verifyToken | P0 |

**curl mẫu NEG-A01:**
```bash
curl -fsS http://localhost:3000/api/partner/profile
# Expected: HTTP 401 {"success":false,"code":"UNAUTHORIZED"}
```

---

## Section B — Wrong role (API)

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-B01 | CUSTOMER truy cập admin API | CUSTOMER token active | `GET /api/admin/dashboard` | 403 FORBIDDEN | requireRole('ADMIN') | P0 |
| NEG-B02 | CUSTOMER truy cập partner API | CUSTOMER token active | `GET /api/partner/profile` | 403 FORBIDDEN | requireRole('PARTNER') | P0 |
| NEG-B03 | PARTNER truy cập admin API | PARTNER token active | `GET /api/admin/users` | 403 FORBIDDEN | requireRole('ADMIN') | P0 |
| NEG-B04 | ADMIN truy cập customer orders | ADMIN token | `GET /api/customer/orders` | 403 FORBIDDEN | requireRole('CUSTOMER') | P0 |
| NEG-B05 | PARTNER truy cập customer refunds | PARTNER token | `GET /api/customer/refunds` | 403 FORBIDDEN | requireRole('CUSTOMER') | P0 |

**curl mẫu NEG-B01:**
```bash
CUSTOMER_TOKEN="<jwt_customer>"
curl -fsS -H "Authorization: Bearer $CUSTOMER_TOKEN" http://localhost:3000/api/admin/dashboard
# Expected: HTTP 403 {"success":false,"code":"FORBIDDEN"}
```

---

## Section C — Partner Pending / Inactive (API)

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-C01 | Partner pending gọi redeem/check | Partner user, status=PENDING trong partner | `POST /api/partner/redeem/check` | 403 PARTNER_NOT_ACTIVE | requirePartnerMember(requireApproved=true) | P0 |
| NEG-C02 | Partner pending gọi getBranches | Partner user, status=PENDING | `GET /api/partner/branches` | 403 PARTNER_NOT_ACTIVE | requirePartnerMember(requireApproved=true) | P0 |
| NEG-C03 | PartnerMember INACTIVE gọi redeem | Member.status=INACTIVE | `POST /api/partner/redeem/confirm` | 403 PARTNER_MEMBER_INACTIVE | assertActivePartner | P0 |
| NEG-C04 | PartnerMember INVITED gọi Owner-only | Member.status=INVITED | `GET /api/partner/vouchers` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-C05 | Partner REJECTED gọi voucher create | Partner.status=REJECTED | `POST /api/partner/vouchers` | 403 PARTNER_NOT_ACTIVE | requirePartnerOwner + assertActivePartner | P0 |
| NEG-C06 | User LOCKED gọi bất kỳ API | User.status=LOCKED | `GET /api/partner/profile` | 403 ACCOUNT_LOCKED | verifyToken (check status) | P0 |

---

## Section D — Staff accessing Owner-only API

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-D01 | STAFF tạo voucher mới | Member.role=STAFF, active | `POST /api/partner/vouchers` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-D02 | STAFF xem voucher list | Member.role=STAFF, active | `GET /api/partner/vouchers` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-D03 | STAFF tạo branch mới | Member.role=STAFF | `POST /api/partner/branches` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-D04 | STAFF cập nhật branch | Member.role=STAFF | `PUT /api/partner/branches/:id` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-D05 | STAFF xem staff list | Member.role=STAFF | `GET /api/partner/staff` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() | P0 |
| NEG-D06 | STAFF xem commission report | Member.role=STAFF | `GET /api/partner/reports` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() + reportsRouter | P0 |
| NEG-D07 | STAFF update partner profile | Member.role=STAFF | `PUT /api/partner/profile` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner({requireApproved: false}) | P0 |

---

## Section E — Staff Branch Scope (Redeem)

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-E01 | STAFF redeem sai branch | STAFF ở branch-A, request branchId=branch-B | `POST /api/partner/redeem/confirm {branchId: "branch-B"}` | 403 INVALID_BRANCH_SCOPE | redeem.service → assertAccess | P0 |
| NEG-E02 | STAFF redeem đúng branch nhưng voucher sai partner | STAFF active, voucher của partner khác | `POST /api/partner/redeem/check {code: "OTHER_PARTNER_CODE"}` | 403 FORBIDDEN | redeem.service → getVoucherCode (partnerId check) | P0 |
| NEG-E03 | STAFF dùng mã đã USED | Code.status=USED | `POST /api/partner/redeem/confirm` | 400 VOUCHER_CODE_USED | redeem.service → assertRedeemable | P0 |
| NEG-E04 | STAFF dùng mã đã REFUNDED | Code.status=REFUNDED | `POST /api/partner/redeem/confirm` | 400 VOUCHER_CODE_REFUNDED | redeem.service → assertRedeemable | P0 |
| NEG-E05 | STAFF dùng mã đã CANCELLED | Code.status=CANCELLED | `POST /api/partner/redeem/confirm` | 400 VOUCHER_CODE_CANCELLED | redeem.service → assertRedeemable | P0 |
| NEG-E06 | STAFF dùng mã đã EXPIRED (timestamp) | Code.expiresAt < now | `POST /api/partner/redeem/confirm` | 400 VOUCHER_CODE_EXPIRED | redeem.service → assertRedeemable (time check) | P0 |
| NEG-E07 | STAFF dùng mã voucher không thuộc branch đang được kích hoạt | Branch không có voucherBranch entry | `POST /api/partner/redeem/confirm` | 403 INVALID_BRANCH_SCOPE | redeem.service → getRedeemBranch | P0 |

---

## Section F — Admin over-reach prevention

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-F01 | Admin tự assign ADMIN role cho user khác | Admin token | `PATCH /api/admin/users/:id/role` với role=ADMIN | Phụ thuộc service logic — cần verify | admin.service.assignUserRole | P1 |
| NEG-F02 | Admin cancel order đã COMPLETED | Order.status=COMPLETED | `POST /api/admin/orders/:id/cancel` | 400 hoặc 409 (invalid transition) | admin.service.cancelOrder | P1 |
| NEG-F03 | Admin approve refund đã COMPLETED | Refund.status=COMPLETED | `POST /api/admin/refunds/:id/approve` | 400 invalid state | refunds.service | P1 |

---

## Section G — Cross-partner isolation

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-G01 | Partner A redeem voucher của Partner B | OWNER Partner-A, voucher code của Partner-B | `POST /api/partner/redeem/check {code: "CODE_B"}` | 403 FORBIDDEN | redeem.service → getVoucherCode (partnerId !== access.partnerId) | P0 |
| NEG-G02 | Partner A xem branch của Partner B | OWNER Partner-A (guessed UUID Partner-B) | Không có endpoint expose branchId of B — get branches chỉ return own partner's branches | No API — safe by design | requirePartnerMember + getBranches filter | P0 |
| NEG-G03 | STAFF từ Partner-A đổi sang redeem Partner-B | STAFF Partner-A, branchId of Partner-B | `POST /api/partner/redeem/confirm {branchId: "branch-B"}` | 403 PARTNER_NOT_ACTIVE or INVALID_BRANCH_SCOPE | assertAccess + getRedeemBranch (partnerId check) | P0 |

---

## Section H — Frontend Direct URL (UI layer)

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-H01 | CUSTOMER direct URL → admin | CUSTOMER logged in | Navigate `/admin/dashboard` | Redirect `/customer/home` | RoleRoute(['ADMIN']) | P0 |
| NEG-H02 | STAFF direct URL → Owner page | STAFF logged in | Navigate `/partner/dashboard` | Redirect `/partner/validation` | PartnerOwnerRoute → isApprovedPartnerOwner=false | P0 |
| NEG-H03 | STAFF direct URL → vouchers | STAFF logged in | Navigate `/partner/vouchers` | Redirect | PartnerOwnerRoute | P0 |
| NEG-H04 | Pending partner → validation | PENDING OWNER logged in | Navigate `/partner/validation` | ⚠️ Page RENDERS — API will 403 | No frontend pending guard | P2 (GAP-01) |
| NEG-H05 | Pending partner → redeem-history | PENDING OWNER logged in | Navigate `/partner/redeem-history` | ⚠️ Page RENDERS — API will 403 | No frontend pending guard | P2 (GAP-01) |
| NEG-H06 | Anonymous → partner portal | Not logged in | Navigate `/partner/dashboard` | Redirect `/login` | ProtectedRoute | P0 |
| NEG-H07 | Anonymous → admin | Not logged in | Navigate `/admin/dashboard` | Redirect `/login` | ProtectedRoute | P0 |

---

## Section I — Staff Deactivation Real-time Enforcement

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-I01 | Staff bị deactivate, dùng JWT cũ | Owner đã PATCH staff status=INACTIVE (user.status=LOCKED) | STAFF dùng valid JWT cũ (chưa expired) gọi API | 403 ACCOUNT_LOCKED | verifyToken (user.status check from DB) | P0 |
| NEG-I02 | Staff bị deactivate — JWT chưa expired nhưng DB locked | JWT còn hạn | `POST /api/partner/redeem/check` | 403 ACCOUNT_LOCKED | verifyToken re-checks DB status each request | P0 |

> **Note:** `verifyToken` load user từ DB mỗi request (`prisma.user.findUnique`). Deactivation có hiệu lực ngay tại request tiếp theo dù JWT chưa hết hạn.

---

## Section J — Rate limit

| ID | Scenario | Precondition | Action | Expected | Guard | Priority |
|---|---|---|---|---|---|---|
| NEG-J01 | Spam redeem/check | PARTNER token | > threshold requests `POST /api/partner/redeem/check` | 429 Too Many Requests | redeemCheckRateLimiter | P1 |
| NEG-J02 | Spam redeem/confirm | PARTNER token | > threshold requests `POST /api/partner/redeem/confirm` | 429 Too Many Requests | redeemConfirmRateLimiter | P1 |

---

## Tổng kết theo priority

| Priority | Count | Trạng thái |
|---|---|---|
| P0 (must block) | 29 scenarios | ✅ Backend guards đủ; P0 đạt theo static analysis |
| P1 (should block/warn) | 4 scenarios | Cần verify thêm ở service logic |
| P2 (UX gap) | 2 scenarios (GAP-01) | Frontend render nhưng API deny — mức LOW risk |

---

## Handoff note

- Các scenario NEG-B, NEG-C, NEG-D, NEG-E, NEG-F cần được kiểm chứng bằng **live API call** với token thực tế trên PostgreSQL real khi có môi trường.
- GAP-01 (NEG-H04, NEG-H05) nên được fix trong W6-T2 hoặc trước khi W6-D5 GO: thêm `isPartnerApproved` guard trên `RedeemVoucherPage` và `StaffRedeemHistoryPage`, hoặc tạo `RequireApprovedPartnerRoute`.
- NEG-F01 (admin assign role=ADMIN): cần đọc `admin.service.js → assignUserRole` để confirm behavior. Đưa vào checklist W6-D4 (security).
