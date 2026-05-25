# Prompt — Partner Voucher Workflow

Implement partner profile, branches, and voucher creation/submission.

Task:
1. Partner profile APIs and UI.
2. Branch CRUD APIs and UI.
3. Partner voucher create/edit/list APIs and UI.
4. Create voucher validation with Zod.
5. Submit voucher from `draft` to `pending_approval`.
6. Create audit logs for create/submit.

Rules:
- Partner must be approved to submit voucher.
- Sale price must be lower than original price.
- Sale and valid periods are required.
- Quantity must be positive.
- Partner can manage only own vouchers.

Acceptance:
- Partner creates draft voucher.
- Partner submits to pending approval.
- Invalid price/date fails.
- Audit log records create/submit.
