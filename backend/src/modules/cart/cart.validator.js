import { z } from "zod";

export const addItemSchema = z.object({
  voucherId: z.string().min(1, "Voucher ID không được để trống"),
  qty: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu phải là 1").optional().default(1)
});

export const updateQtySchema = z.object({
  qty: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu phải là 1")
});
