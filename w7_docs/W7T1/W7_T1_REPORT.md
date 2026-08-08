# W7-T1 — Partner/Admin Test Stabilization

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-T1 — Partner/Admin test stabilization  
**Branch:** `Partner/Admin-test-stabilization`  
**Tester:** Partner / Admin E2E Lead  
**Ngày:** 2026-08-08  
**Trạng thái:** ✅ PASS

---

## Outcome

Verify lại toàn bộ W6 Ops test suite (role/branch/redeem/approval/refund/report/audit).  
Không có fixture order-dependency, không có shared used-code state, các business error code đều được assert đúng.  
Không cần sửa code hay fixture — suite đã ổn định từ W6.

---

## Commands đã chạy & kết quả

| Command | Cwd | Kết quả |
|---|---|---|
| `npx vitest run --fileParallelism=false tests/rbac-authorization.test.js tests/admin-approval.test.js tests/partner-redeem-api.test.js tests/partner-reports.test.js tests/admin-orders-audit.test.js tests/refund-concurrency-dedicated.test.js tests/partner-branches-api.test.js` | `backend/` | ✅ **7/7 files, 65/65 tests PASS** |
| `npm test` | `backend/` | ✅ **27/27 files, 202/202 tests PASS** |
| `npm run test:unit:node` | `backend/` | ✅ **13/13 PASS** |
| `npm test -- --run` | `frontend/` | ✅ **13/13 files, 33/33 tests PASS** |
| `npm run test:unit:node` | `frontend/` | ✅ **2/2 PASS** |
| `npm run build` | `frontend/` | ✅ **PASS** (2663 modules, exit 0) |

---

## Acceptance Criteria

| Tiêu chí | Kết quả |
|---|---|
| No order-dependent fixture | ✅ Pass — mỗi test tự tạo fixture độc lập |
| No shared used-code state | ✅ Pass — mã voucher không tái dụng giữa các test |
| Expected business codes asserted | ✅ Pass — `PARTNER_NOT_ACTIVE`, `FORBIDDEN`, `INVALID_BRANCH_SCOPE`, `VOUCHER_CODE_ALREADY_USED`, `VOUCHER_CODE_REFUND_PENDING`, `VOUCHER_CODE_REFUNDED` đều có assert tường minh |

---

## Luồng nghiệp vụ đã cover (qua automated test)

- **RBAC:** Admin, Partner Owner, Branch Staff, Customer — không rò rỉ role
- **Partner Approval:** `PENDING` → `APPROVED`, chặn `PARTNER_NOT_ACTIVE` trước khi duyệt
- **Branch Scope:** Staff chỉ redeem đúng chi nhánh mình, sai chi nhánh → `403 INVALID_BRANCH_SCOPE`
- **Redeem Integrity:** chống redeem lặp (`ALREADY_USED`), chống redeem khi `REFUND_PENDING`/`REFUNDED`
- **Refund:** Admin xử lý manual refund, transition trạng thái đúng
- **Audit Trail:** log ghi đủ actor/action/target/requestId, không lộ secret
- **Partner Reports:** commission summary trả đúng cấu trúc VND

---

## File thay đổi

Không có file source code nào bị thay đổi.  
Chỉ tạo: `w7_docs/W7T1/W7_T1_REPORT.md`

---

## Lỗi còn lại

Không có.

---

## Task tiếp theo

Chuyển sang task tiếp theo trong kế hoạch W7.
