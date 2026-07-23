-- Identity verification and partner membership

CREATE TYPE "PartnerMemberRole" AS ENUM ('OWNER', 'STAFF');
CREATE TYPE "PartnerMemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'RESET_PASSWORD', 'STAFF_SETUP');
CREATE TYPE "PaymentMethod" AS ENUM ('VIVOUCH_WALLET', 'PAYOS');
CREATE TYPE "WalletTransactionType" AS ENUM ('PAYMENT', 'REFUND', 'ADMIN_ADJUSTMENT');
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'MANUAL_REFUND_REQUIRED', 'REFUNDED');
CREATE TYPE "SupportTicketType" AS ENUM ('PAYMENT_PROBLEM', 'VOUCHER_NOT_ACCEPTED', 'REFUND_REQUEST', 'CODE_PROBLEM', 'OTHER');
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'PROCESSING', 'RESOLVED', 'REJECTED');
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_SUCCESS', 'VOUCHER_ISSUED', 'REFUND_RESOLVED', 'TICKET_RESPONDED', 'PARTNER_APPROVED', 'PARTNER_REJECTED', 'VOUCHER_APPROVED', 'VOUCHER_REJECTED', 'STAFF_ACCOUNT_CREATED');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

ALTER TABLE "User"
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", "createdAt") WHERE "status" = 'ACTIVE';
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';

ALTER TABLE "Partner"
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "bankAccountNumber" TEXT;

ALTER TABLE "Voucher"
  ADD COLUMN "allowRefund" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "refundWindowHours" INTEGER NOT NULL DEFAULT 24;

ALTER TABLE "Order" ADD COLUMN "requestFingerprint" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "requestId" TEXT;

ALTER TABLE "Payment" ADD COLUMN "providerOrderCode" TEXT;
ALTER TABLE "Payment" ADD COLUMN "providerPaymentLinkId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "providerReference" TEXT;
ALTER TABLE "Payment" ADD COLUMN "checkoutUrl" TEXT;
ALTER TABLE "Payment" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Payment" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod"
USING (CASE WHEN "method" = 'PAYOS' THEN 'PAYOS'::"PaymentMethod" ELSE 'VIVOUCH_WALLET'::"PaymentMethod" END);

CREATE UNIQUE INDEX "Payment_providerOrderCode_key" ON "Payment"("providerOrderCode");
CREATE UNIQUE INDEX "Payment_providerPaymentLinkId_key" ON "Payment"("providerPaymentLinkId");
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

CREATE TABLE "EmailOtp" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "purpose" "OtpPurpose" NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerMember" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "branchId" TEXT,
  "role" "PartnerMemberRole" NOT NULL,
  "status" "PartnerMemberStatus" NOT NULL DEFAULT 'INVITED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PartnerMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Wallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" DECIMAL(12,0) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WalletTransaction" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" "WalletTransactionType" NOT NULL,
  "amount" DECIMAL(12,0) NOT NULL,
  "balanceBefore" DECIMAL(12,0) NOT NULL,
  "balanceAfter" DECIMAL(12,0) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentWebhook" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefundRequest" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
  "adminNote" TEXT,
  "providerRefundReference" TEXT,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicket" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" "SupportTicketType" NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "adminResponse" TEXT,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailDelivery" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "recipient" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailOtp_email_purpose_expiresAt_idx" ON "EmailOtp"("email", "purpose", "expiresAt");
CREATE INDEX "EmailOtp_userId_purpose_idx" ON "EmailOtp"("userId", "purpose");
CREATE UNIQUE INDEX "PartnerMember_partnerId_userId_key" ON "PartnerMember"("partnerId", "userId");
CREATE INDEX "PartnerMember_userId_status_idx" ON "PartnerMember"("userId", "status");
CREATE INDEX "PartnerMember_partnerId_role_status_idx" ON "PartnerMember"("partnerId", "role", "status");
CREATE INDEX "PartnerMember_branchId_idx" ON "PartnerMember"("branchId");
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");
CREATE INDEX "WalletTransaction_orderId_idx" ON "WalletTransaction"("orderId");
CREATE UNIQUE INDEX "PaymentWebhook_eventKey_key" ON "PaymentWebhook"("eventKey");
CREATE INDEX "PaymentWebhook_paymentId_createdAt_idx" ON "PaymentWebhook"("paymentId", "createdAt");
CREATE UNIQUE INDEX "RefundRequest_orderId_key" ON "RefundRequest"("orderId");
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");
CREATE INDEX "RefundRequest_userId_createdAt_idx" ON "RefundRequest"("userId", "createdAt");
CREATE INDEX "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId", "createdAt");
CREATE INDEX "SupportTicket_status_createdAt_idx" ON "SupportTicket"("status", "createdAt");
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");
CREATE INDEX "EmailDelivery_status_createdAt_idx" ON "EmailDelivery"("status", "createdAt");
CREATE INDEX "EmailDelivery_userId_createdAt_idx" ON "EmailDelivery"("userId", "createdAt");

ALTER TABLE "EmailOtp" ADD CONSTRAINT "EmailOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentWebhook" ADD CONSTRAINT "PaymentWebhook_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill existing partner owners and demo wallets without changing existing access.
INSERT INTO "PartnerMember" ("id", "partnerId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), p."id", p."userId", 'OWNER'::"PartnerMemberRole", 'ACTIVE'::"PartnerMemberStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Partner" p
ON CONFLICT ("partnerId", "userId") DO NOTHING;

INSERT INTO "Wallet" ("id", "userId", "balance", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text), u."id", 1000000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User" u
WHERE u."role" = 'CUSTOMER'
ON CONFLICT ("userId") DO NOTHING;
