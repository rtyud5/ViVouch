import { z } from 'zod';

export const redeemVoucherCodeSchema = z.object({
  code: z.string().trim().min(1, 'Thiếu mã voucher'),
  branchId: z.string().trim().min(1, 'Thiếu chi nhánh đổi voucher'),
});
