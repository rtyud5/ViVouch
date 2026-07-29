# W6-T1 — Outcome Report

**Task:** W6-T1 — Partner/Admin compatibility & permission matrix  
**Owner:** Tùng — Partner / Admin Operations  
**Sprint:** W6 (2026-07-28 → 2026-08-01)  

---

## Header

```
TASK_ID=W6-T1
BRANCH=main
SHA=66e305ed1691279d293361d570ef39e638df3acd
STARTED_AT=2026-07-29T12:31:09+07:00
COMPLETED_AT=2026-07-29T12:36:58+07:00
COMMAND=static code analysis (route files, middleware, layout, guards)
ENVIRONMENT=Windows 11, Node 20 (not executed — static analysis)
EXIT_CODE=0 (analysis complete)
```

---

## Mục tiêu

Đối chiếu route/menu/API cho Admin, Partner Owner và Branch Staff để:
1. Xây dựng permission matrix UI/API
2. Lập portal route smoke report
3. Liệt kê negative scenarios cần kiểm chứng

---

## Root Cause / Context

W6 là sprint integration/hardening. Không viết thêm feature. W6-T1 là QA tĩnh xác nhận rằng các RBAC guards đã được wire đúng sau khi W5 merge vào baseline.

---

## File đã phân tích (read-only, không thay đổi)

| File | Mô tả |
|---|---|
| `backend/src/middlewares/auth.middleware.js` | JWT verify + user status check |
| `backend/src/middlewares/role.middleware.js` | requireRole factory |
| `backend/src/middlewares/partnerAccess.middleware.js` | requirePartnerMember / requirePartnerOwner |
| `backend/src/app.js` | Router mounting toàn bộ |
| `backend/src/modules/admin/admin.routes.js` | Admin endpoints |
| `backend/src/modules/partners/partners.routes.js` | Partner endpoints |
| `backend/src/modules/partnerMembers/partnerMembers.routes.js` | Staff sub-routes |
| `backend/src/modules/refunds/refunds.routes.js` | Customer + Admin refund split |
| `backend/src/modules/supportTickets/supportTickets.routes.js` | Customer + Admin ticket split |
| `backend/src/modules/reports/reports.routes.js` | Partner commission report |
| `backend/src/modules/redeem/redeem.service.js` | Branch scope enforcement |
| `backend/src/modules/partners/partners.service.js` | getPartnerAccessByUserId + getProfile |
| `backend/src/modules/partnerMembers/partnerMembers.service.js` | createStaff / updateStaff / deactivation |
| `backend/src/modules/cms/cms.admin.routes.js` | CMS admin endpoints |
| `backend/src/constants/roles.js` | ROLES constant |
| `frontend/src/routes/AppRoutes.jsx` | Frontend route tree |
| `frontend/src/routes/ProtectedRoute.jsx` | Auth guard |
| `frontend/src/routes/RoleRoute.jsx` | Role guard |
| `frontend/src/routes/PartnerOwnerRoute.jsx` | Owner guard |
| `frontend/src/utils/roleLanding.js` | getRoleLandingPath + isApprovedPartnerOwner |
| `frontend/src/layouts/PartnerLayout.jsx` | Partner sidebar menu filter |
| `frontend/src/layouts/AdminLayout.jsx` | Admin sidebar menu |

---

## Commands đã chạy

```bash
git status --short      # working tree clean
git rev-parse HEAD      # 66e305ed1691279d293361d570ef39e638df3acd
git log --oneline -20   # confirm W6-D1 integration merge tại top
```

---

## Pass / Fail / Skip

| Category | Pass | Fail | Skip | Notes |
|---|---|---|---|---|
| Admin route guards | 11/11 | 0 | 0 | verifyToken + requireRole(ADMIN) đúng toàn bộ |
| Partner Owner guards | 10/10 | 0 | 0 | requirePartnerOwner() đúng trên tất cả Owner-only route |
| Partner Member guards | 4/4 | 0 | 0 | requirePartnerMember() đúng trên shared routes |
| Staff branch scope | 1/1 | 0 | 0 | assertAccess STAFF branchId enforced |
| Frontend role guards | 7/8 | 0 | 1 GAP | GAP-01: pending không bị chặn ở frontend cho /validation và /redeem-history |
| Menu isolation | 3/3 | 0 | 0 | 3 states (pending/STAFF/OWNER) menu đúng |
| Cross-partner isolation | 2/2 | 0 | 0 | partnerId check trong redeem.service |

**Live API negative test:** SKIP — chưa có live environment. Cần chạy bằng token thực tế trên PostgreSQL thật (giao W6-T5 hoặc môi trường dev).

---

## DB Side Effects

Không có. Task này là read-only analysis. Không thay đổi DB.

---

## Evidence

| File | Nội dung |
|---|---|
| `W6T1_01_permission_matrix.md` | Matrix API/UI đầy đủ, findings F-01...F-10 |
| `W6T1_02_portal_route_smoke_report.md` | Smoke report từng role, direct URL matrix |
| `W6T1_03_negative_scenarios.md` | 46 negative scenarios, sections A–J, priority P0/P1/P2 |
| `W6T1_outcome.md` | File này |

---

## Acceptance Criteria — Đánh giá

| Criterion | Đạt? | Ghi chú |
|---|---|---|
| Direct URL không vượt quyền (backend) | ✅ ĐẠT | verifyToken + requireRole + requirePartnerOwner chain đủ |
| Direct URL không vượt quyền (frontend) | ⚠️ PARTIAL | GAP-01: pending user thấy trang trước khi API deny |
| STAFF chỉ thấy nghiệp vụ branch | ✅ ĐẠT | Menu PartnerLayout, PartnerOwnerRoute, assertAccess |
| Partner pending không vào vận hành | ✅ ĐẠT (API) | requirePartnerMember requireApproved=true block |
| Partner pending không vào vận hành | ⚠️ PARTIAL (UI) | /validation và /redeem-history render khi pending |
| Manual role sessions | 🔲 PENDING | Cần live environment — kế hoạch W6-T5 |
| API 401/403 sampling | 🔲 PENDING | Live sampling cần PostgreSQL thật |

---

## Remaining Risk

| ID | Risk | Mức | Action |
|---|---|---|---|
| R-01 (GAP-01) | `/partner/validation` và `/partner/redeem-history` load khi pending — UX gap, backend OK | LOW | Thêm guard frontend trong W6-T2 hoặc cuối W6 |
| R-02 | JWT không bị invalidate ngay khi STAFF deactivated — delay 1 request | ACCEPTABLE | verifyToken check DB status mỗi request — chặn được. Document cho W7 Redis blacklist |
| R-03 | NEG-F01: admin.service.assignUserRole chưa verify không cho assign ADMIN role | MEDIUM | Đưa vào W6-D4 security checklist |
| R-04 | Live API negative test chưa chạy trên PostgreSQL thật | MEDIUM | W6-T5 regression evidence |

---

## Handoff

- **W6-T2:** Fix GAP-01 (pending guard ở validation/redeem-history), verify Partner apply/approval/Staff UI flow
- **W6-D4:** Verify NEG-F01 (admin assign role self-escalation)
- **W6-T5:** Chạy live API negative sessions với token thực tế, record evidence
- **W6-D5:** Cần live evidence từ W6-T5 trước khi sign off

**W6-T1 status:** `COMPLETE — deliverables created — pending live API evidence`
