import { z } from 'zod';

export const createRefundSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().min(10).max(1000),
});

export const resolveRefundSchema = z.object({
  adminNote: z.string().trim().min(3).max(1000),
});

export const completeManualRefundSchema = resolveRefundSchema.extend({
  providerRefundReference: z.string().trim().min(3).max(200),
});
