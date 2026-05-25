# Frontend Stack Specification

## 1. React 18 + Vite + JavaScript
Use React for all UI. Use Vite for development/build.

Expected frontend apps/pages:

```text
public catalog
customer area
partner portal
admin dashboard
```

## 2. React Router v6
Required for role-based page routing.

Routes:

```text
/                         public home
/login                    login
/register                 customer register
/partner-register         partner register
/vouchers                 public catalog
/vouchers/:id             voucher detail

/customer/cart
/customer/checkout
/customer/orders
/customer/my-vouchers
/customer/profile

/partner/dashboard
/partner/profile
/partner/branches
/partner/vouchers
/partner/vouchers/create
/partner/redeem
/partner/reports

/admin/dashboard
/admin/users
/admin/partners
/admin/vouchers
/admin/orders
/admin/categories
/admin/banners
/admin/audit-logs
```

Route guard requirements:

- Unauthenticated users cannot access protected routes.
- Customer cannot access partner/admin routes.
- Partner cannot access customer/admin routes.
- Admin cannot be blocked from admin routes.

## 3. TailwindCSS + DaisyUI
Use Tailwind utility classes and DaisyUI components.

Required UI components:

| Component | Use |
|---|---|
| `VoucherCard` | Catalog grid/list |
| `StatusBadge` | Show voucher/order/code status |
| `DataTable` | Admin/partner tables |
| `ConfirmModal` | Approve/reject/redeem confirmations |
| `DashboardStatCard` | Dashboard metrics |
| `SearchFilterBar` | Catalog/admin filters |
| `EmptyState` | Empty lists |
| `LoadingSpinner` | Query loading |
| `ErrorAlert` | API errors |

DaisyUI examples:

```jsx
<button className="btn btn-primary">Mua ngay</button>
<div className="badge badge-success">on_sale</div>
<div className="card bg-base-100 shadow-xl">...</div>
```

## 4. TanStack Query
Use for server state.

Query keys standard:

```js
['vouchers', filters]
['voucher', voucherId]
['cart']
['orders', userId]
['my-voucher-codes']
['partner-vouchers', filters]
['admin-vouchers', filters]
['admin-dashboard']
['audit-logs', filters]
```

Mutation invalidation examples:

| Mutation | Invalidate |
|---|---|
| Admin approves voucher | `['admin-vouchers']`, `['vouchers']`, `['voucher', id]` |
| Checkout success | `['cart']`, `['my-voucher-codes']`, `['orders']`, `['vouchers']` |
| Partner redeems code | `['partner-reports']`, `['admin-dashboard']`, `['my-voucher-codes']` |

## 5. Zustand
Use for client-only state.

Recommended stores:

```text
stores/authStore.js
stores/uiStore.js
```

Auth store fields:

```js
user
accessToken
role
isAuthenticated
login()
logout()
setUser()
```

UI store fields:

```js
sidebarOpen
theme
setSidebarOpen()
setTheme()
```

## 6. React Hook Form + Zod
Required forms:

- Login form.
- Register form.
- Partner profile form.
- Create/edit voucher form.
- Checkout form.
- Redeem code form.
- Admin reject reason modal.

Validation examples:

- Email valid.
- Password required.
- Sale price lower than original price.
- Quantity greater than 0.
- Sale start before sale end.
- Valid from before valid to.

## 7. qrcode.react
Use in `MyVoucherCard` or voucher detail after purchase.

QR content recommendation:

```text
voucherCode.code
```

Optional: encode URL:

```text
/partner/redeem?code=VC-2026-ABC123
```

## 8. Recharts
Required charts:

- Revenue by day.
- Orders by status.
- Voucher code usage ratio.
- Top vouchers.
- Top partners.

## 9. Frontend API client
Use one Axios or fetch wrapper.

Required behavior:

- Base URL from `VITE_API_BASE_URL`.
- Attach JWT access token.
- Handle 401 logout.
- Normalize error messages.

File:

```text
src/services/apiClient.js
```
