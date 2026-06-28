import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, "Voucher ID không được để trống"),
      qty: z.coerce.number().int("Số lượng phải là số nguyên").min(1, "Số lượng tối thiểu phải là 1").optional().default(1)
    })
  ).min(1, "Danh sách sản phẩm không được rỗng"),
  paymentMethod: z.string().optional().default("MOCK_GATEWAY")
});

