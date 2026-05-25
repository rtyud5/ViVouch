# Roles, Permissions, and RBAC Matrix

## 1. Role model
The system uses RBAC: Role-Based Access Control.

Required roles:

```text
customer
partner
admin
```

Optional simplification:
- `partner_staff` can be omitted in MVP and represented as `partner`.
- If added later, `partner_staff` should only check/redeem voucher codes, not create campaigns.

## 2. Role descriptions

### Customer
A customer can browse vouchers, purchase vouchers, receive voucher code/QR after payment, and view order/voucher history.

### Partner
A partner represents a business/service provider. A partner can manage profile, branches, voucher campaigns, and redeem voucher codes at applicable branches/programs.

### Admin
An admin represents platform operator. Admin approves partners and vouchers, manages users/orders/content, views reports, and reads audit logs.

## 3. Permission matrix

| Capability | Public | Customer | Partner | Admin |
|---|---:|---:|---:|---:|
| View public vouchers | Yes | Yes | Yes | Yes |
| Search/filter vouchers | Yes | Yes | Yes | Yes |
| Register customer account | Yes | No | No | No |
| Register partner profile | Yes/Partner signup | No | Yes | Admin can manage |
| Login/logout | Yes | Yes | Yes | Yes |
| Update own profile | No | Yes | Yes | Yes |
| Add to cart | No | Yes | No | No |
| Checkout | No | Yes | No | No |
| View own orders | No | Yes | No | Admin all |
| View own voucher codes | No | Yes | No | Admin all |
| Review voucher | No | Yes if purchased/used | No | Moderation optional |
| Create voucher campaign | No | No | Yes if partner approved | Optional admin create |
| Submit voucher for approval | No | No | Yes | No |
| Edit voucher | No | No | Limited by status | Yes |
| Approve/reject voucher | No | No | No | Yes |
| Check voucher code | No | No | Yes within scope | Yes |
| Redeem voucher code | No | No | Yes within scope | Optional/no |
| Manage users | No | No | No | Yes |
| Manage partners | No | No | Own profile only | Yes |
| Manage content | No | No | No | Yes |
| View dashboard | No | Own summaries | Own reports | Platform reports |
| View audit logs | No | No | No | Yes |

## 4. Backend RBAC rules

Agents must implement RBAC as backend middleware, not only frontend route guards.

Required middleware:

```js
requireAuth
requireRole('customer')
requireRole('partner')
requireRole('admin')
requireAnyRole(['admin', 'partner'])
```

## 5. Frontend route guards

Required frontend guards:

```text
PublicRoute
ProtectedRoute
RoleRoute
```

Examples:

| Route | Required role |
|---|---|
| `/customer/*` | customer |
| `/partner/*` | partner |
| `/admin/*` | admin |

## 6. Ownership rules

Backend must enforce ownership checks:

1. Customer can view only their own orders and voucher codes.
2. Partner can view/manage only vouchers belonging to their partner profile.
3. Partner can redeem only voucher codes linked to their own voucher/branch/program.
4. Admin can access all platform data.

## 7. Agent implementation warnings

- Do not rely on frontend hidden buttons for security.
- Do not trust `role` from request body.
- Decode JWT and fetch user status from DB if necessary.
- Block locked/suspended users and partners.
- Check partner status before allowing voucher creation/submission/redeem.
