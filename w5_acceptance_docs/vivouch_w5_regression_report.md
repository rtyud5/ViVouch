# ViVouch W5.3 — Regression Report

**Ngày thực hiện:** 2026-07-09 (Thứ 5)
**Người thực hiện:** Duy (Regression Coordinator)
**Branch hiện tại:** `main` (sau W5.0–W5.8 fixes)
**Seed baseline:** `node prisma/seed.js` — chạy sạch, login được 3 role

---

## 1. Kết quả tổng quan

| Hạng mục | Kết quả |
|:---|---:|
| **Backend API Tests** | ✅ **16/16 test files — 142/142 tests pass** |
| **Full W4 E2E Flow** | ✅ **Checkout → Redeem → Review pass trên seed chuẩn** |
| **Admin Portal API** | ✅ Dashboard, Partners, Users, Orders, Audit Logs đều trả data |
| **Partner Portal API** | ✅ Profile, Vouchers (4), Reports range hoạt động |
| **Customer Portal API** | ✅ Browse, Cart, Checkout, My Vouchers, Review hoạt động |
| **Redeem Edge Cases** | ✅ USED/EXPIRED/wrong_partner/not_found đều trả lỗi đúng code |

---

## 2. Test Flow Results

### 🔵 Flow 1: Admin Portal (ADM-01 → ADM-11)
| Scope | Pass | Fail | Block |
|:---|---:|---:|---:|
| Đăng nhập + Dashboard + KPI | ✅ 11 | ❌ 0 | ⛔ 0 |

- **B105 (Modal z-index):** ✅ Đã fix
- Admin revenue chart là dữ liệu mẫu (badge rõ) — acceptable cho W5

### 🟢 Flow 2: Partner Portal (PTN-01 → PTN-11)
| Scope | Pass | Fail | Block |
|:---|---:|---:|---:|
| Dashboard + Vouchers + Reports + Redeem | ✅ 8 | ❌ 3 | ⛔ 0 |

- **B103** (P2 — Dashboard chart time filter): ❌ Không wire → backlog W6
- **B104** (P2 — "Xem tất cả" no onClick): ❌ → backlog W6
- **B102** (P3 — BranchesPage stub): ❌ → backlog W6
- Partner Dashboard KPI = real data; chart/timeline = mock

### 🟡 Flow 3: Customer Portal (CUS-01 → CUS-13)
| Scope | Pass | Fail | Block |
|:---|---:|---:|---:|
| Browse + Cart + Checkout + Profile | ✅ 11 | ❌ 1 | ⛔ 1 (partial) |

- **B101** (P2 — Checkout no Back button): ❌ → backlog W6
- **B106** (P2 — Review form `userEligibility`): ⚠️ Partial — form UI có, BE API hoạt động, nhưng backend không trả `userEligibility` → form luôn ở NOT_ELIGIBLE

### 🟣 Flow 4: Redeem Code (RDM-01 → RDM-07)
| Scope | Pass | Fail | Block |
|:---|---:|---:|---:|
| ISSUED/USED/EXPIRED/wrong partner/not found | ✅ 7 | ❌ 0 | ⛔ 0 |

- Tất cả edge cases pass
- FE error card hiển thị đúng message (USED/EXPIRED/wrong partner/not found)

---

## 3. Bug Gate Assessment

**Nguyên tắc:**
- 🚫 **P0** (crash/500): Fix ngay → _không có_
- 🔴 **P1** (sai quyền/sai dữ liệu): Fix trước Thứ 6 → B105 **đã fix**
- 🟡 **P2/P3** (UX/UI/polish): Ghi backlog W6

### Bug mở sau regression

| ID | Level | Component | Mô tả | Quyết định |
|:---|:---:|:---|---:|---:|
| B101 | **P2** | `CheckoutPage.jsx` | Thiếu nút Back → Cart | → **Backlog W6** |
| B102 | **P3** | `BranchesPage.jsx` | Stub rỗng, không nội dung | → **Backlog W6** |
| B103 | **P2** | `PartnerDashboardPage.jsx` | Bộ lọc thời gian chart không wire state | → **Backlog W6** |
| B104 | **P2** | `PartnerDashboardPage.jsx` | Nút "Xem tất cả" thiếu onClick | → **Backlog W6** |
| B106 | **P2** | `VoucherDetailPage.jsx` + BE vouchers service | `userEligibility` backend chưa trả → form review luôn NOT_ELIGIBLE | → **Backlog W6** |

> **Feature creep check:** ✅ Không phát hiện feature creep. Tất cả changes trong W5 là fix/hardening chính đáng.

---

## 4. Seed Data Verification

| Role | Email | Password | Status |
|:---|---|:---|---:|
| Admin | admin@vivouch.com | Admin@123 | ✅ Login OK, Dashboard data OK |
| Partner | haidilao@vivouch.com | Partner@123 | ✅ Login OK, 4 vouchers, reports OK |
| Customer | customer1@test.com | Test@123 | ✅ Login OK, 7 voucher codes, checkout OK |

Seed data includes edge cases:
- Voucher codes: ISSUED, USED, EXPIRED, wrong partner, not found
- Vouchers: ON_SALE, PENDING_APPROVAL, APPROVED, REJECTED

---

## 5. Checklist W5 — Post-Regression

| Item | Status |
|:---|---:|
| Full flow W4 pass sau mọi fix | ✅ |
| Không còn bug P0/P1 | ✅ (B105 đã fix) |
| BRD matrix đã rà | ✅ |
| Checkout + recipient/policy/QR/code | ✅ (thiếu Back button — backlog) |
| Redeem edge cases pass | ✅ |
| AdminDashboard không crash | ✅ |
| Security baseline | ⏳ (W5.2 đang làm) |
| Seed chạy sạch | ✅ |
| Modal B105 fixed | ✅ |

---

## 6. Candidate List cho Stable Tag `v0.9-assignment-complete`

**Gate pass requirement:** Full W4 flow pass trên seed chuẩn, không còn P0/P1.

### Candidate: **SẴN SÀNG — ĐỢI Security Baseline (W5.2) xong**

**Cần hoàn tất trước khi tag:**
1. ✅ W5.2 (Security baseline + env contract) — _đang chạy song song_
2. ✅ W5.7 (API regression tests) — đã merge
3. Chạy lại full regression 1 lần cuối sau W5.2 merge

**Sau khi tag:**
1. Tạo branch `release/v0.9-assignment-complete`
2. Chạy reset DB + seed → full flow E2E
3. Ghi release note ngắn
4. Chuyển sang W6 production-like phase trên branch riêng

---

## 7. Technical Debt → W6 Backlog (từ Bug Gate)

| Priority | Item | Bug ref |
|:---|---|:---:|
| Medium | Thêm nút Back trên CheckoutPage (navigate(-1) hoặc Link to /customer/cart) | B101 |
| Medium | Kết nối select range vào state + fetch API thật cho Partner Dashboard chart | B103 |
| Medium | Thêm onClick handler cho "Xem tất cả" trên Partner Dashboard timeline | B104 |
| Medium | FE Wire review form: backend trả `userEligibility` để form hiển thị ELIGIBLE | B106 |
| Low | Quyết định scope Branches: W6 hoặc out-of-scope | B102 |
