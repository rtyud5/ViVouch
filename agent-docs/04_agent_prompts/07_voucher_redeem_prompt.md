# Prompt — Partner Redeem Voucher

Implement partner voucher code check and redemption.

Task:
1. `GET /api/partner/redeem/check?code=`.
2. `POST /api/partner/redeem/confirm`.
3. Redeem UI with input and result panel.
4. Use transaction/conditional update to prevent double redeem.
5. Create VoucherUsageLog and AuditLog.

Rules:
- Partner must be approved.
- Code must exist.
- Code status must be issued.
- Code must not be expired.
- Voucher must belong to this partner.
- Branch must be valid for voucher.
- Used/expired/cancelled/locked code cannot be redeemed.

Acceptance:
- Valid code can be redeemed once.
- Second redeem attempt fails.
- Wrong partner fails.
- Expired code fails.
- Usage log and audit log are created.
