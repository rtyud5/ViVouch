-- CreateIndex
CREATE INDEX "Review_voucherId_idx" ON "Review"("voucherId");

-- CreateIndex
CREATE INDEX "SupportTicket_orderId_idx" ON "SupportTicket"("orderId");

-- CreateIndex
CREATE INDEX "VoucherCode_orderId_idx" ON "VoucherCode"("orderId");

-- CreateIndex
CREATE INDEX "VoucherCode_voucherId_idx" ON "VoucherCode"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherUsageLog_voucherCodeId_idx" ON "VoucherUsageLog"("voucherCodeId");

-- CreateIndex
CREATE INDEX "VoucherUsageLog_branchId_idx" ON "VoucherUsageLog"("branchId");

-- CreateIndex
CREATE INDEX "VoucherUsageLog_redeemedBy_idx" ON "VoucherUsageLog"("redeemedBy");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_orderId_type_key" ON "WalletTransaction"("orderId", "type");
