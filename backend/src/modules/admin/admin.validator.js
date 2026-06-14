import { z } from 'zod';

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
