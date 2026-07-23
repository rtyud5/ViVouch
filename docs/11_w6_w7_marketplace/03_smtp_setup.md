# SMTP Setup

## Environment

Copy `backend/.env.example` to `backend/.env` and set:

```env
EMAIL_VERIFICATION_REQUIRED=true
EMAIL_DELIVERY_MODE=SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_EHLO_HOST=localhost
SMTP_USER=your-user
SMTP_PASSWORD=your-app-password
MAIL_FROM_NAME=ViVouch
MAIL_FROM_ADDRESS=no-reply@example.com
OTP_PEPPER=a-long-random-secret
```

Use an application password where the mail provider supports it. Do not commit credentials.

- Port 465 normally uses `SMTP_SECURE=true`.
- Port 587 normally uses `SMTP_SECURE=false` and `SMTP_REQUIRE_TLS=true`.
- When TLS is required but the server does not advertise STARTTLS, delivery fails rather than sending credentials over plaintext SMTP.

## Delivery modes

- `SMTP`: sends real mail.
- `TEST`: stores mail in the in-process test mailbox for automated tests.
- `LOG`: logs recipient/subject only; it never logs OTP content.

OTP email is immediate because the user is waiting. Other transactional mail is written to `EmailDelivery` and retried by the database-backed worker. A transactional email failure does not roll back a completed payment or voucher issuance.

## Manual smoke

1. Register with a real inbox.
2. Confirm that a six-digit OTP arrives.
3. Enter one wrong OTP and then the correct OTP.
4. Confirm one-time use by replaying the OTP.
5. Test resend cooldown.
6. Test password reset.
7. Check logs for absence of OTP, password, token, and SMTP password.
