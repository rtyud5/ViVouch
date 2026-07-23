import { z } from 'zod';

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
});

export const roleSchema = z.object({
  role: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']),
});

export const partnerStatusSchema = z.object({
  status: z.enum(['APPROVED', 'SUSPENDED']),
  reason: z.string().trim().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required').max(500),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
export const ordersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING_PAYMENT', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().optional(),
});

export const partnersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  search: z.string().optional(),
});

export const vouchersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ON_SALE', 'PAUSED', 'EXPIRED', 'REJECTED', 'SUSPENDED']).optional(),
  search: z.string().optional(),
});

export const auditLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  actorId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const walletAdjustmentSchema = z.object({
  amount: z.number().int().min(-100000000).max(100000000).refine((value) => value !== 0, 'Số tiền phải khác 0'),
  note: z.string().trim().min(3).max(300),
});
