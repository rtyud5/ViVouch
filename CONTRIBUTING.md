# Contributing Guide

Recommended branch strategy:

- `main`: stable submission/demo branch
- `develop`: integration branch
- `feature/auth`
- `feature/customer-voucher`
- `feature/partner-voucher`
- `feature/admin-dashboard`
- `feature/order-checkout`
- `feature/redeem-voucher`

Workflow:

1. Create a feature branch from `develop`.
2. Implement one small feature only.
3. Create pull request into `develop`.
4. Review, test, then merge.
5. Merge `develop` into `main` only when stable.
