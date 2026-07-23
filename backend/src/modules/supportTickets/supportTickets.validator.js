import { z } from 'zod';
export const createTicketSchema = z.object({
  orderId: z.string().uuid().optional().nullable(),
  type: z.enum(['PAYMENT_PROBLEM', 'VOUCHER_NOT_ACCEPTED', 'REFUND_REQUEST', 'CODE_PROBLEM', 'OTHER']),
  subject: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(2000),
});
export const respondTicketSchema = z.object({
  status: z.enum(['PROCESSING', 'RESOLVED', 'REJECTED']),
  adminResponse: z.string().trim().min(3).max(2000),
});
