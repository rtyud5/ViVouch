import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import * as auditLog from '../auditLogs/auditLog.service.js';

async function mapUniqueError(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Tên hoặc slug đã tồn tại', 409, 'CONTENT_ALREADY_EXISTS');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError('Không tìm thấy nội dung', 404, 'CONTENT_NOT_FOUND');
    }
    throw error;
  }
}

const snapshot = (value) => structuredClone(value);

async function createAudited(model, targetType, data, actorId) {
  return mapUniqueError(() => prisma.$transaction(async (tx) => {
    const entity = await tx[model].create({ data });
    await auditLog.log(actorId, AUDIT_ACTIONS.ADMIN_MANAGE_CONTENT, targetType, entity.id, {
      operation: 'CREATE',
      newValues: snapshot(entity),
    }, tx);
    return entity;
  }));
}

async function updateAudited(model, targetType, id, data, actorId) {
  return mapUniqueError(() => prisma.$transaction(async (tx) => {
    const previous = await tx[model].findUnique({ where: { id } });
    if (!previous) throw new AppError('Không tìm thấy nội dung', 404, 'CONTENT_NOT_FOUND');
    const entity = await tx[model].update({ where: { id }, data });
    await auditLog.log(actorId, AUDIT_ACTIONS.ADMIN_MANAGE_CONTENT, targetType, id, {
      operation: 'UPDATE',
      oldValues: snapshot(previous),
      newValues: snapshot(entity),
    }, tx);
    return entity;
  }));
}

async function deleteAudited(model, targetType, id, actorId) {
  return mapUniqueError(() => prisma.$transaction(async (tx) => {
    const previous = await tx[model].findUnique({ where: { id } });
    if (!previous) throw new AppError('Không tìm thấy nội dung', 404, 'CONTENT_NOT_FOUND');
    await tx[model].delete({ where: { id } });
    await auditLog.log(actorId, AUDIT_ACTIONS.ADMIN_MANAGE_CONTENT, targetType, id, {
      operation: 'DELETE',
      oldValues: snapshot(previous),
    }, tx);
  }));
}

export const listCategories = () => prisma.category.findMany({ orderBy: { name: 'asc' } });
export const createCategory = (data, actorId) => createAudited('category', 'Category', data, actorId);
export const updateCategory = (id, data, actorId) => updateAudited('category', 'Category', id, data, actorId);
export async function deleteCategory(id, actorId) {
  await mapUniqueError(() => prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({ where: { id }, include: { _count: { select: { vouchers: true } } } });
    if (!category) throw new AppError('Không tìm thấy danh mục', 404, 'CONTENT_NOT_FOUND');
    if (category._count.vouchers > 0) throw new AppError('Danh mục đang có voucher và không thể xóa', 409, 'CATEGORY_IN_USE');
    await tx.category.delete({ where: { id } });
    const { _count, ...previous } = category;
    await auditLog.log(actorId, AUDIT_ACTIONS.ADMIN_MANAGE_CONTENT, 'Category', id, {
      operation: 'DELETE',
      oldValues: snapshot(previous),
    }, tx);
  }));
}

export const listPages = () => prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
export const createPage = (data, actorId) => createAudited('cmsPage', 'CmsPage', data, actorId);
export const updatePage = (id, data, actorId) => updateAudited('cmsPage', 'CmsPage', id, data, actorId);
export const deletePage = (id, actorId) => deleteAudited('cmsPage', 'CmsPage', id, actorId);
export async function getPublishedPage(slug) {
  const page = await prisma.cmsPage.findFirst({ where: { slug, status: 'PUBLISHED' } });
  if (!page) throw new AppError('Không tìm thấy trang nội dung', 404, 'CONTENT_NOT_FOUND');
  return page;
}

export const listBanners = () => prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }] });
export const listActiveBanners = (position) => prisma.banner.findMany({
  where: { isActive: true, ...(position ? { position } : {}) },
  orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }],
});
export const createBanner = (data, actorId) => createAudited('banner', 'Banner', data, actorId);
export const updateBanner = (id, data, actorId) => updateAudited('banner', 'Banner', id, data, actorId);
export const deleteBanner = (id, actorId) => deleteAudited('banner', 'Banner', id, actorId);
