import { z } from 'zod';

// ── Helpers ──────────────────────────────────────────────────────────────────
const coercePositiveInt = (fallback) =>
  z.coerce.number().int().positive().default(fallback);

// ── List vouchers query params ───────────────────────────────────────────────
export const listVouchersSchema = z.object({
  page: coercePositiveInt(1),
  limit: coercePositiveInt(12).refine((v) => v <= 48, { message: 'limit must be <= 48' }),
  keyword: z.string().trim().optional(),
  categoryId: z.string().optional(),// Bỏ dùng .uuid để tiện cho việc sử dụng seed
  city: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  sort: z.enum(['popularity', 'newest', 'price_asc', 'price_desc']).default('popularity'),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['minPrice'],
  }
);

// ── Get voucher by ID params ─────────────────────────────────────────────────
export const getVoucherByIdSchema = z.object({
  id: z.string().min(1),
});

// ── Partner voucher list query params ────────────────────────────────────────
export const partnerVoucherFiltersSchema = z.object({
  page: coercePositiveInt(1),
  limit: coercePositiveInt(12).refine((v) => v <= 48, { message: 'limit must be <= 48' }),
});

// ── Create voucher body ──────────────────────────────────────────────────────
export const createVoucherSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  originalPrice: z.number().int().positive(),
  salePrice: z.number().int().positive(),
  totalQty: z.number().int().positive(),
  saleStart: z.coerce.date().optional(),
  saleEnd: z.coerce.date().optional(),
  useStart: z.coerce.date().optional(),
  useEnd: z.coerce.date().optional(),
  conditions: z.string().optional(),
  cancelPolicy: z.string().optional(),
}).refine(data => data.salePrice < data.originalPrice, {
  message: 'salePrice phải nhỏ hơn originalPrice',
  path: ['salePrice'],
});

// ── Update voucher body ──────────────────────────────────────────────────────
export const updateVoucherSchema = z.object({
  categoryId: z.string().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  originalPrice: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().optional(),
  totalQty: z.number().int().positive().optional(),
  saleStart: z.coerce.date().optional(),
  saleEnd: z.coerce.date().optional(),
  useStart: z.coerce.date().optional(),
  useEnd: z.coerce.date().optional(),
  conditions: z.string().optional(),
  cancelPolicy: z.string().optional(),
}).refine(data => {
  if (data.originalPrice !== undefined && data.salePrice !== undefined) {
    return data.salePrice < data.originalPrice;
  }
  return true;
}, {
  message: 'salePrice phải nhỏ hơn originalPrice',
  path: ['salePrice'],
});