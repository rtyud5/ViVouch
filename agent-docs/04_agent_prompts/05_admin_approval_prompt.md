# Prompt — Admin Approval Workflow

Implement admin management for partners and vouchers.

Task:
1. Admin partner list and approve/reject/suspend APIs/UI.
2. Admin voucher list and approve/reject/pause APIs/UI.
3. Require reject reason for rejection.
4. Add audit logs for all admin actions.
5. Add status badges and filters.

Rules:
- Only admin can approve/reject.
- Invalid status transitions must fail.
- Approved voucher can become on_sale when sale period is valid.

Acceptance:
- Admin approves pending voucher.
- Admin rejects pending voucher with reason.
- Non-admin cannot call approval APIs.
- Audit log page shows actions.
