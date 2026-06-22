import { z } from 'zod';

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
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
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().optional(),
});

export const vouchersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().optional(),
});

export const auditLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
});
