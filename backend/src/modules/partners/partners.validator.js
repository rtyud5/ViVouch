import { z } from 'zod';

export const updateProfileSchema = z.object({
  businessName: z.string().trim().min(1).optional(),
  representativeName: z.string().trim().min(1).optional(),
  // Có thể không cho phép update taxCode hoặc để optional
});

export const createBranchSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1).default("Hồ Chí Minh"),
  isActive: z.boolean().default(true),
});

export const updateBranchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
});
