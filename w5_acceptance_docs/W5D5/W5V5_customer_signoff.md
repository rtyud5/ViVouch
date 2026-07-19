# W5-V5: Portal Sign-Off Document (Customer)

**Date:** 2026-07-19  
**SHA:** 0bfef02 (main, up-to-date)  
**Operator:** Customer Portal Lead (Vinh)  
**Reviewer:** Team sign-off required  

---

## Rubric Coverage — Customer Portal

| Rubric Item | Implementation | Evidence | Status |
|---|---|---|---|
| Browse/search voucher | `GET /api/vouchers` | Customer home & list page | ✅ COMPLETE |
| Xem chi tiết voucher | `GET /api/vouchers/:id` | Voucher detail page | ✅ COMPLETE |
| Cart & quantity | React state, context | Cart modal/page | ✅ COMPLETE |
| Checkout flow | `POST /api/orders` | Checkout page | ✅ COMPLETE |
| My vouchers list | `GET /api/customer/vouchers` | My Vouchers page | ✅ COMPLETE |
| Order history | `GET /api/orders` | Orders page | ✅ COMPLETE |
| Profile review | `GET /api/users/profile` | Profile page | ✅ COMPLETE |
| Responsive layout | TailwindCSS/DaisyUI classes | Tested on 375/768/1280 | ✅ COMPLETE |
| Prevent out-of-stock buy | Backend guard | Unit test / Negative flow | ✅ COMPLETE |
| RBAC enforcement | role middleware (CUSTOMER) | Auth tests, role check | ✅ COMPLETE |

---

## Acceptance Criteria Verification

| Criterion | Result | Evidence |
|---|---|---|
| Demo không cần chỉnh DB thủ công | ✅ | Seed data chuẩn, E2E flow mượt |
| Flow pass từ seed chuẩn | ✅ | Checked Browse->Cart->Checkout |
| Không che mock payment limitation | ✅ | Mock payment được highlight là W5 limitation |
| Tất cả customer core rubric có evidence | ✅ | 10/10 items checked |
| No console error | ✅ | Frontend build clean |

---

## P0/P1 Status

| Issue | Severity | Status |
|---|---|---|
| Duplicate order submission | P1 potential | ✅ MITIGATED — Nút checkout disable/loading khi submit |
| Stale cache sau khi checkout | P1 potential | ✅ MITIGATED — React Query invalidate queries |

**P0/P1 = 0 tại thời điểm sign-off.**

---

## Sign-Off Decision

| Gate | Status |
|---|---|
| All P0/P1 closed | ✅ |
| Rubric evidence 100% | ✅ |
| Demo rehearsable | ✅ |
| Responsive + console clean | ✅ |
| W6 backlog itemized | ✅ |

**DECISION: ✅ GO — Customer portal đủ điều kiện demo candidate cho W5 sign-off.**

---

*Signed: Vinh — Customer Portal Lead, W5-V5*  
*Date: 2026-07-19*
