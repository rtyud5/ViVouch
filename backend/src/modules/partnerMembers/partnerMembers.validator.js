import { z } from 'zod';

export const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim()
    .regex(/^(\+84|0)\d{8,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)')
    .optional().nullable(),
  branchId: z.string().uuid(),
});

export const updateStaffSchema = z.object({
  branchId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine((data) => Object.keys(data).length > 0, 'Cần ít nhất một thay đổi');
