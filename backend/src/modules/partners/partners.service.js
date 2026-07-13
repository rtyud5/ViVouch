import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export async function getPartnerByUserId(userId) {
  const partner = await prisma.partner.findUnique({ where: { userId } });
  if (!partner) {
    throw new AppError('Không tìm thấy hồ sơ Partner', 404, 'PARTNER_NOT_FOUND');
  }
  return partner;
}

export async function getApprovedPartnerByUserId(userId) {
  const partner = await getPartnerByUserId(userId);
  if (partner.status !== 'APPROVED') {
    throw new AppError(
      'Tài khoản Partner chưa được duyệt hoặc đã bị tạm ngưng',
      403,
      'PARTNER_NOT_ACTIVE',
    );
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
  const branch = await prisma.branch.findUnique({ 
    where: { id: branchId },
    include: {
      _count: {
        select: { voucherBranches: true, usageLogs: true }
      }
    }
  });
  if (!branch) {
    throw new AppError('Không tìm thấy chi nhánh', 404, 'BRANCH_NOT_FOUND');
  }
  if (branch.partnerId !== partner.id) {
    throw new AppError('Không có quyền thao tác trên chi nhánh này', 403, 'FORBIDDEN');
  }
  
  if (branch._count.voucherBranches > 0 || branch._count.usageLogs > 0) {
    throw new AppError('Chi nhánh đang được sử dụng (đã gắn voucher hoặc có lịch sử đổi mã), không thể xóa. Bạn có thể chuyển trạng thái ngưng hoạt động thay vì xóa.', 409, 'BRANCH_IN_USE');
  }

  return prisma.branch.delete({
    where: { id: branchId }
  });
}
