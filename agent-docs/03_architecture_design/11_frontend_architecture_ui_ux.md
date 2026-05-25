# Frontend Architecture and UI/UX Requirements

## 1. UX principle
The system must feel like an e-commerce voucher marketplace, not an admin-only CRUD app.

## 2. Customer UI requirements

### Home/catalog
- Banner.
- Categories.
- Featured vouchers.
- Search bar.
- Filters.
- Voucher cards.

Voucher card must show:

- Image.
- Name.
- Partner.
- Original price.
- Sale price.
- Discount.
- Remaining quantity or sold count.
- Status badge.

### Detail page
Must show:

- Voucher information.
- Usage terms.
- Sale/valid dates.
- Applicable branches.
- Refund/cancel policy.
- Reviews.
- Add to cart and buy now.

### Cart/checkout
- Clear quantity and subtotal.
- Validate availability before checkout.
- Simulated payment method.
- Confirmation state.

### My vouchers
- Voucher code.
- QR code.
- Status badge.
- Expiry date.
- Branch/terms.

## 3. Partner UI requirements

- Sidebar navigation.
- Dashboard metrics.
- Profile and branch management.
- Voucher list with statuses.
- Voucher create/edit form grouped into sections.
- Redeem page with large input and clear result.
- Reports.

Redeem result states:

| State | UI behavior |
|---|---|
| Valid issued code | Show voucher/customer/expiry and confirm button |
| Used | Show used warning and used time |
| Expired | Show expired error |
| Wrong partner | Show forbidden/invalid scope |
| Not found | Show not found |

## 4. Admin UI requirements

- Dashboard first.
- Data tables with search/filter/pagination.
- Status badges.
- Action buttons: approve, reject, pause, lock.
- Modal for reject reason.
- Audit log page.

## 5. Responsive design
Use Tailwind/DaisyUI responsive classes.

Minimum:

- Catalog usable on mobile.
- Cart/checkout responsive.
- Admin tables horizontally scroll on small screens.
- Sidebar collapses or drawer on mobile.

## 6. Frontend architecture rules

- API calls live in `services/`.
- React Query hooks can live in `hooks/` or alongside services.
- Auth state lives in Zustand.
- Reusable UI components in `components/`.
- Pages should compose components, not contain all logic.
- Do not hardcode API URLs; use environment variable.

## 7. Status badge consistency
Implement one `StatusBadge` component to avoid inconsistent colors/labels.

## 8. Error/loading UX
Every API page should handle:

- Loading state.
- Empty state.
- Error state.
- Success toast where useful.
