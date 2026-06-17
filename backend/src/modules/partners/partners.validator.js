import { z } from 'zod';

export const updateProfileSchema = z.object({
  businessName: z.string().trim().min(1).max(255).optional(),
  representativeName: z.string().trim().min(1).max(255).optional(),
  // Có thể không cho phép update taxCode hoặc để optional
}).refine(data => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });

export const createBranchSchema = z.object({
  name: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(255).default("Hồ Chí Minh"),
  isActive: z.boolean().default(true),
});

export const updateBranchSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  city: z.string().trim().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });
