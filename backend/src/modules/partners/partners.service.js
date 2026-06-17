import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export async function getPartnerByUserId(userId) {
  const partner = await prisma.partner.findUnique({ where: { userId } });
  if (!partner) {
    throw new AppError('Không tìm thấy hồ sơ Partner', 404, 'PARTNER_NOT_FOUND');
  }
  return partner;
}

export async function getProfile(userId) {
  const partner = await getPartnerByUserId(userId);
  return partner;
}

export async function updateProfile(userId, data) {
  const partner = await getPartnerByUserId(userId);
  return prisma.partner.update({
    where: { id: partner.id },
    data
  });
}

export async function getBranches(userId) {
  const partner = await getPartnerByUserId(userId);
  return prisma.branch.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBranch(userId, data) {
  const partner = await getPartnerByUserId(userId);
  return prisma.branch.create({
    data: {
      ...data,
      partnerId: partner.id
    }
  });
}

export async function updateBranch(userId, branchId, data) {
  const partner = await getPartnerByUserId(userId);
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) {
    throw new AppError('Không tìm thấy chi nhánh', 404, 'BRANCH_NOT_FOUND');
  }
  if (branch.partnerId !== partner.id) {
    throw new AppError('Không có quyền thao tác trên chi nhánh này', 403, 'FORBIDDEN');
  }
  return prisma.branch.update({
    where: { id: branchId },
    data
  });
}

export async function deleteBranch(userId, branchId) {
  const partner = await getPartnerByUserId(userId);
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) {
    throw new AppError('Không tìm thấy chi nhánh', 404, 'BRANCH_NOT_FOUND');
  }
  if (branch.partnerId !== partner.id) {
    throw new AppError('Không có quyền thao tác trên chi nhánh này', 403, 'FORBIDDEN');
  }
  return prisma.branch.delete({
    where: { id: branchId }
  });
}
