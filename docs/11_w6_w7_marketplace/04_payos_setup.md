# payOS Hosted VietQR Setup

## Environment

```env
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=https://frontend.example.com/customer/payment-result
PAYOS_CANCEL_URL=https://frontend.example.com/customer/payment-result
PUBLIC_API_URL=https://api.example.com
```

All three credentials must be configured together. Never expose them to the frontend.

## Webhook URL

Configure the public HTTPS endpoint:

```text
POST https://api.example.com/api/payments/payos/webhook
```

The backend verifies the payOS signature and checks the order code and amount. Duplicate events are idempotent. Only the verified webhook marks payment `PAID` and issues voucher codes.

## Demo checklist

1. Create a low-value demo voucher.
2. Checkout using payOS.
3. Verify redirect to the hosted payment page.
4. Complete VietQR payment.
5. Confirm the webhook changes the order to `COMPLETED`.
6. Confirm exactly the purchased quantity of voucher codes.
7. Replay the same webhook and confirm no duplicate code or notification.
8. Keep a successful recording and the ViVouch Wallet path as demo fallback.

Automatic payOS refund is intentionally out of scope. Admin records the external manual refund reference before completing the refund in ViVouch.
