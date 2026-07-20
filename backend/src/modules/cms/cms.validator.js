import { z } from 'zod';

const slug = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ');

export const idSchema = z.object({ id: z.string().uuid() });
export const slugParamSchema = z.object({ slug });

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug,
  icon: z.string().trim().max(100).nullable().optional(),
});
export const categoryUpdateSchema = categorySchema.partial().refine((data) => Object.keys(data).length > 0);

export const pageSchema = z.object({
  slug,
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1).max(50000),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});
export const pageUpdateSchema = pageSchema.partial().refine((data) => Object.keys(data).length > 0);

export const bannerSchema = z.object({
  title: z.string().trim().min(1).max(255),
  imageUrl: z.string().url().max(1000),
  linkUrl: z.string().url().max(1000).nullable().optional(),
  position: z.enum(['HOME_HERO', 'HOME_SECONDARY', 'POPUP']).default('HOME_HERO'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});
export const bannerUpdateSchema = bannerSchema.partial().refine((data) => Object.keys(data).length > 0);
