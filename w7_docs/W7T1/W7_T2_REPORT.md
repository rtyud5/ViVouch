# W7-T2 — Partner/Admin Cross-role E2E + Core BRD Closure

**Project:** ViVouch Marketplace-Lite
**Sprint:** Week 7
**Task:** W7-T2 — Partner/Admin cross-role E2E + Admin branch/voucher lifecycle closure
**Tester:** Partner / Admin E2E Lead
**Ngày:** 2026-08-09
**Trạng thái:** ✅ PASS

---

## Outcome

**Không cần viết thêm test hay sửa source code.**

Toàn bộ cross-role E2E, admin branch/voucher lifecycle, wrong-branch guard, duplicate/refund-pending
redeem guard và role session isolation đã được cover đầy đủ bởi test suite W6.

**Root cause của lần chạy đầu tiên thất bại:**
Test DB `voucher_platform_test` chưa tồn tại trên server PostgreSQL local.
Fix: `prisma migrate deploy` với `DATABASE_URL` trỏ vào `voucher_platform_test`
→ tạo và migrate 13 migrations thành công → toàn bộ suite xanh.

---

## Commands đã chạy & kết quả

| Command | Cwd | Kết quả |
|---|---|---|
| `$env:DATABASE_URL='...test'; npx prisma migrate deploy` | `backend/` | ✅ DB `voucher_platform_test` tạo mới, 13 migrations applied |
| `$env:NODE_ENV='test'; npx vitest run --fileParallelism=false tests/rbac-authorization.test.js tests/admin-approval.test.js tests/partner-redeem-api.test.js tests/partner-reports.test.js tests/admin-orders-audit.test.js tests/refund-concurrency-dedicated.test.js tests/partner-branches-api.test.js` | `backend/` | ✅ **7/7 files, 65/65 tests PASS** |
| `$env:NODE_ENV='test'; npm test` | `backend/` | ✅ **27/27 files, 202/202 tests PASS** |
| `$env:NODE_ENV='test'; npm run test:unit:node` | `backend/` | ✅ **13/13 PASS** |
| `npm test -- --run` | `frontend/` | ✅ **13/13 files, 33/33 tests PASS** |

---

## Acceptance Criteria

| Tiêu chí | Kết quả |
|---|---|
| Admin branch + voucher lifecycle closure PASS | ✅ admin-approval.test.js: approve/reject partner & voucher, saleStart/saleEnd timing (A/B/C), audit log đầy đủ |
| Wrong branch không consume code | ✅ partner-redeem-api.test.js: INVALID_BRANCH_SCOPE → code vẫn ISSUED |
| Duplicate/refund-pending code không redeem | ✅ USED→VOUCHER_CODE_USED; REF-CON-03 redeem-vs-refund race; REF-CON-04 idempotency |
| Role sessions tách biệt | ✅ rbac-authorization.test.js: Customer/PartnerA/PartnerB/Staff/Admin/LegacySuspended; cross-partner 403 |

---

## Chi tiết BRD đã verify

### Admin Branch + Voucher Lifecycle
- Partner Approval: PENDING → APPROVED (transaction + auditLog ADMIN_APPROVE_PARTNER)
- Partner Reject: PENDING → REJECTED (reason required, auditLog ADMIN_REJECT_PARTNER)
- Self-action block: Admin không approve/reject partner của chính mình → 400 SELF_ACTION, DB không đổi, không có audit log
- Voucher Approve A (saleStart đã qua): PENDING_APPROVAL → ON_SALE, approvedAt/By set, published=true trong audit
- Voucher Approve B (saleStart tương lai): PENDING_APPROVAL → APPROVED (không phải ON_SALE), published=false
- Voucher Approve C (saleEnd đã hết hạn): PENDING_APPROVAL → APPROVED, published=false
- Voucher Reject: reason required, REJECTED + rejectReason, audit ADMIN_REJECT_VOUCHER
- Invalid transition guard: Approve voucher không ở PENDING_APPROVAL → 400 INVALID_TRANSITION

### Cross-role E2E + Branch Scope
- Staff chỉ redeem đúng chi nhánh → 403 INVALID_BRANCH_SCOPE nếu sai branch
- Partner không redeem code của Partner khác → 403 FORBIDDEN
- Admin cancel order → codes CANCELLED, payment REFUNDED, soldQty restored, auditLog ADMIN_CANCEL_ORDER
- Concurrent refund race: chỉ 1 trong 2 request song song thành công (row-level lock)
- Redeem vs approve-refund race: chỉ 1 thắng (REF-CON-03)

### DB/Audit Assertions
- auditLog.actorId, targetType, targetId, requestId đầy đủ mọi action
- voucherUsageLog tạo cùng transaction với redeem
- soldQty restore atomic khi cancel/refund

---

## File thay đổi

Không có file source code nào bị thay đổi.

**Hành động duy nhất:** Tạo test DB `voucher_platform_test` bằng `prisma migrate deploy`.

Chỉ tạo: `w7_docs/W7T1/W7_T2_REPORT.md`

---

## Lỗi còn lại

Không có.

---

## Task tiếp theo

Chuyển sang task tiếp theo trong kế hoạch W7 (W7-D1, W7-V1, v.v.).
