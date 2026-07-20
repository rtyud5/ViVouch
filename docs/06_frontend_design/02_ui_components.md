# UI Component Design

| Component group | Responsibility |
|---|---|
| `VoucherCard`, detail tabs, quantity selector | Catalog discovery and product detail |
| `VoucherFilter`, `SortDropdown`, `Pagination` | URL-preserved search/filter/sort/page state |
| Cart/checkout components | Quantity, totals, recipient, payment simulation |
| `QRCodeModal`, `CopyButton`, status badges | Purchased voucher presentation |
| `WriteReviewForm`, `ReviewList` | Eligibility-aware feedback |
| Partner voucher/branch/redeem pages | Campaign and location operations; check-before-confirm UX |
| `AdminTable`, KPI cards, status badges | Management lists and dashboards |
| `ConfirmModal` | Explicit confirmation for destructive/irreversible actions |
| Loading/empty/error/toast components | Consistent async feedback |
| `DashboardLayout` | Portal shell, responsive navigation, logout |

## UX rules

- Every remote screen has loading, empty, error, and success feedback.
- Irreversible redemption shows validated customer/voucher/branch data before confirmation.
- Admin cancellation explains code cancellation, stock restoration, and simulated refund.
- Filters are reflected in the URL so back/forward navigation is predictable.
- Controls expose labels or ARIA text; color is not the only state indicator.
- Mobile layouts avoid fixed-width tables without an overflow container.
