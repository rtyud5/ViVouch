-- Existing PostgreSQL enum types must be extended in a separate migration.
-- This guarantees the new values are committed before subsequent migrations use them.
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
ALTER TYPE "VoucherCodeStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "VoucherCodeStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
