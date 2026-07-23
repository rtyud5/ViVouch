import { z } from 'zod';

const paymentMethod = z.enum(['VIVOUCH_WALLET', 'PAYOS']).default('VIVOUCH_WALLET');
const common = {
  paymentMethod,
  recipientName: z.string().trim().max(100).optional().nullable(),
  recipientPhone: z.string().trim().max(15).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
};

export const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1, 'Voucher ID không được để trống'),
    qty: z.coerce.number().int().min(1).max(20).default(1),
  })).min(1, 'Danh sách sản phẩm không được rỗng'),
  ...common,
});

export const cartCheckoutSchema = z.object(common);
