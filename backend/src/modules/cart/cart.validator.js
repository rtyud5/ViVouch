import { z } from "zod";

export const addItemSchema = z.object({
  voucherId: z.string().uuid("Voucher ID không hợp lệ (phải là định dạng UUID)"),
  qty: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu phải là 1").optional().default(1)
});

export const updateQtySchema = z.object({
  qty: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu phải là 1")
});
