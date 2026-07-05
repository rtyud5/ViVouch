import { z } from 'zod';

export const REPORT_RANGE_OPTIONS = [7, 30, 90];

export const partnerReportsQuerySchema = z.object({
  range: z.coerce
    .number()
    .int()
    .refine((value) => REPORT_RANGE_OPTIONS.includes(value), {
      message: 'range phải là 7, 30 hoặc 90',
    })
    .default(30),
});
