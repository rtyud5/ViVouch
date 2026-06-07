import { z } from 'zod';

// ── Helpers ──────────────────────────────────────────────────────────────────
const coercePositiveInt = (fallback) =>
  z.coerce.number().int().positive().default(fallback);

// ── List vouchers query params ───────────────────────────────────────────────
export const listVouchersSchema = z.object({
  page:        coercePositiveInt(1),
  limit:       coercePositiveInt(12).refine((v) => v <= 48, { message: 'limit must be <= 48' }),
  keyword:     z.string().trim().optional(),
  categoryId:  z.string().uuid().optional(),
  city:        z.string().trim().optional(),
  minPrice:    z.coerce.number().nonnegative().optional(),
  maxPrice:    z.coerce.number().nonnegative().optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  sort:        z.enum(['popularity', 'newest', 'price_asc', 'price_desc']).default('popularity'),
});

// ── Get voucher by ID params ─────────────────────────────────────────────────
export const getVoucherByIdSchema = z.object({
  id: z.string().uuid(),
});
