# Roles and Permissions

Authorization is enforced by `verifyToken` and `requireRole`; hiding a frontend button is not treated as a security control.

| Capability | Public | Customer | Partner | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse catalog/detail/reviews | ✓ | ✓ | ✓ | ✓ |
| Register/login/reset password | ✓ | ✓ | ✓ | ✓ |
| Manage own profile | — | ✓ | ✓ | ✓ |
| Cart/checkout/orders/codes | — | ✓ | — | View/manage |
| Submit review after use | — | ✓ | — | View |
| Manage own branches/vouchers | — | — | ✓ | View/control |
| Check and confirm redemption | — | — | ✓, own scope | Audit |
| User role/lock management | — | — | — | ✓ |
| Partner approval/suspension | — | — | — | ✓ |
| Voucher approval/rejection | — | — | — | ✓ |
| CMS/dashboard/audit logs | — | — | — | ✓ |

## Security invariants

- Registration always creates a `CUSTOMER`; an admin action is required for role changes.
- A user cannot change or lock their own admin identity.
- A `PARTNER` role requires an approved Partner profile.
- Partner services verify both `userId → Partner` ownership and `Partner.status = APPROVED`.
- Branch mutations and redemption require that the branch belongs to the authenticated partner.
- Changing a user role revokes active refresh tokens.
- Suspended/locked identities cannot continue privileged operations.
