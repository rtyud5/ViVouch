# Data Dictionary

| Entity | Primary purpose | Important fields/invariants |
|---|---|---|
| `User` | Identity and role | unique email/phone; hashed password; CUSTOMER/PARTNER/ADMIN; ACTIVE/LOCKED |
| `Partner` | Business profile | unique user/tax code; approval status; representative |
| `Branch` | Partner location | partner ownership; city/address; active flag; unique name per partner |
| `Category` | Catalog classification | unique name and URL slug |
| `Voucher` | Sellable campaign | partner/category; prices; stock; sale/use dates; lifecycle status |
| `VoucherBranch` | Campaign–location scope | compound key `(voucherId, branchId)` |
| `Cart` / `CartItem` | Customer selection | one cart/user; one row per voucher/cart; positive quantity |
| `Order` | Purchase aggregate | customer; idempotency key; total; recipient; status |
| `OrderItem` | Immutable purchase line | voucher, quantity, unit price snapshot |
| `Payment` | Simulated settlement | one/order; method; PENDING/PAID/REFUNDED/FAILED |
| `VoucherCode` | Purchased entitlement | unique code; order/voucher/owner; issue/expiry/use timestamps; status |
| `VoucherUsageLog` | Redemption fact | code, partner user, branch, timestamp |
| `Review` | Post-use feedback | rating 1–5; one user/voucher; optional comment |
| `AuditLog` | Traceability | actor/action/target; metadata; old/new values; IP; user agent; time |
| `RefreshToken` | Rotating session/reset token store | unique token; expiry; revocation; cascade on user delete |
| `Banner` | Banner/popup content | image/link, position, active flag, ordering |
| `CmsPage` | Article/policy content | unique slug; title/body; DRAFT/PUBLISHED |

## Decimal and time handling

Money is stored as `Decimal(12,0)` in Vietnamese đồng and converted explicitly at API boundaries. All database timestamps are UTC `DateTime`; UI formatting uses the Vietnamese locale. Date-window checks execute on the server/database, not from the client clock.

## Deletion policy

Transactional history is retained. Branches or categories referenced by business data cannot be deleted; they are deactivated or receive a conflict response. Refresh tokens cascade with user deletion because they contain no independent business history.
