# W5/W6 Prioritized Backlog

**Date:** 2026-07-20  
**Baseline SHA:** `260e8f8` (main)  
**Status:** Frozen for W6 Planning

This document consolidates all Open partial implementations, tech debt, and known limitations from the W5 sprint into a prioritized list for the W6 and W7 sprints.

---

## 1. Top Priority — P1/P2 Operations Hardening (W6-D1)

| ID | Description | Component | Rationale & Definition of Done | Est. | Target |
|----|-------------|-----------|--------------------------------|---|---|
| **B201** | **Pagination Implementation** | FE/BE | Currently, most FE tables render all returned data. Need standard `?page=1&limit=10` on BE and integrated table components on FE. | 1D | W6-D1 |
| **B102** | **Branch Management (CRUD)** | FE/BE | BranchesPage is a stub. Partner cannot add/edit branches. BE routes are stubbed. This blocks real Redemptions. | 1D | W6-D1 |
| **B106** | **Review System `userEligibility`** | BE/FE | P2 Bug from W5. Customer review form is always NOT_ELIGIBLE because BE doesn't return eligibility flag. Needs BE update to check `USED` vouchers. | 0.5D | W6-D2 |

---

## 2. High Priority — Data Realism & Integrations (W6-D2 → D3)

| ID | Description | Component | Rationale & Definition of Done | Est. | Target |
|----|-------------|-----------|--------------------------------|---|---|
| **B202** | **Admin KPI Dashboard Real Data** | FE | Chart revenue is currently hardcoded mock data. Expand BE to return 30-day time-series and wire to ECharts. | 0.5D | W6-D2 |
| **B103** | **Partner Chart Time Filter** | FE/BE | P2 Bug. Dropdown time filter (7/30/90 days) on Partner Dashboard doesn't trigger BE reload. Wire state to `useQuery`. | 0.5D | W6-D2 |
| **B203** | **Payment Gateway Integration** | BE/FE | Replace mock payment `/api/customer/orders/checkout` with VNPAY/Momo sandbox endpoints. Handle callback verification. | 2D | W6-D3 |

---

## 3. Medium Priority — Outstanding Functional (W6-D4 → D5)

| ID | Description | Component | Rationale & Definition of Done | Est. | Target |
|----|-------------|-----------|--------------------------------|---|---|
| **B108** | **Category CRUD** | FE/BE | P3 OOS. Admins cannot create new categories. BE is stubbed. Needs full CRUD module for Admin categories tab. | 1D | W6-D4 |
| **B101** | **Checkout Back Button** | FE | P2 Bug. User cannot navigate back to Cart from checkout page without browser button. Add explicit UI affordance. | <0.5D | W6-D4 |
| **B104** | **"View All" Links** | FE | P2 Bug. Dashboard "view all" buttons have no onClick. Map to appropriate list pages. | <0.5D | W6-D4 |

---

## 4. Tech Debt & Architecture (W7)

| ID | Description | Component | Rationale & Definition of Done | Est. | Target |
|----|-------------|-----------|--------------------------------|---|---|
| **B110** | **Rate Limiting** | BE | P3 Tech Debt. `rateLimit.middleware.js` is a stub. Wire `express-rate-limit` to Auth, Checkout, and Redeem paths. | 0.5D | W7 |
| **B111** | **Global Validator** | BE | P3 Tech Debt. Migration to a generic Zod validator middleware to clean up repetitive logic in controllers. | 1D | W7 |
| **B109** | **CMS Pages Component** | FE | P3 OOS. Static content management (T&C, Help). Very low priority. | 0.5D | W7 |
| **B204** | **Image Upload** | BE/FE | Vouchers currently rely on static/placeholder URLs for covers. Implement local Multer/Cloudinary upload. | 1D | W7 |

---

## Summary

*   **P0/P1 Defects:** 0 (W5 Clean)
*   **W5 Carry-over Bugs:** 4 (B101, B102, B103, B104, B106)
*   **Major W6 Themes:** Payment Gateway, Real time-series Data, Branch CRUD.
