import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export async function getPartnerAccessByUserId(userId, { includeInactive = false } = {}) {
  const member = await prisma.partnerMember.findFirst({
    where: {
      userId,
      ...(includeInactive ? {} : { status: { in: ['ACTIVE', 'INVITED'] } }),
    },
    include: { partner: true, branch: true },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });

  if (member) return member;

  // Compatibility fallback for data created before PartnerMember existed.
  const partner = await prisma.partner.findUnique({ where: { userId } });
  if (!partner) {
    throw new AppError('Không tìm thấy hồ sơ Partner', 404, 'PARTNER_NOT_FOUND');
  }

  return {
    id: null,
    userId,
    partnerId: partner.id,
    branchId: null,
    role: 'OWNER',
    status: 'ACTIVE',
    partner,
    branch: null,
  };
}

export async function getPartnerByUserId(userId) {
  const access = await getPartnerAccessByUserId(userId);
  return access.partner;
}

export async function getApprovedPartnerByUserId(userId) {
  const access = await getPartnerAccessByUserId(userId);
  if (access.status !== 'ACTIVE' || access.partner.status !== 'APPROVED') {
    throw new AppError(
      'Tài khoản Partner chưa được duyệt hoặc đã bị tạm ngưng',
      403,
      'PARTNER_NOT_ACTIVE',
    );
  }
  return access.partner;
}

export async function getProfile(userId) {
  const access = await getPartnerAccessByUserId(userId, { includeInactive: true });
  const sharedProfile = {
    id: access.partner.id,
    businessName: access.partner.businessName,
    status: access.partner.status,
    rejectReason: access.partner.rejectReason,
    contactEmail: access.partner.contactEmail,
    contactPhone: access.partner.contactPhone,
    address: access.partner.address,
    createdAt: access.partner.createdAt,
    updatedAt: access.partner.updatedAt,
  };
  const ownerOnlyProfile = access.role === 'OWNER' ? {
    taxCode: access.partner.taxCode,
    representativeName: access.partner.representativeName,
    bankName: access.partner.bankName,
    bankAccountNumber: access.partner.bankAccountNumber,
  } : {};
  return {
    ...sharedProfile,
    ...ownerOnlyProfile,
    membership: {
      id: access.id,
      role: access.role,
      status: access.status,
      branch: access.branch,
    },
  };
}

export async function updateProfile(userId, data) {
  const access = await getPartnerAccessByUserId(userId);
  if (access.role !== 'OWNER') {
    throw new AppError('Chức năng này chỉ dành cho Partner Owner', 403, 'PARTNER_OWNER_REQUIRED');
  }
  return prisma.partner.update({ where: { id: access.partnerId }, data });
}

export async function getBranches(userId) {
  const access = await getPartnerAccessByUserId(userId);
  const where = access.role === 'STAFF'
    ? { id: access.branchId, partnerId: access.partnerId }
    : { partnerId: access.partnerId };
  return prisma.branch.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function createBranch(userId, data) {
  const access = await getPartnerAccessByUserId(userId);
  if (access.role !== 'OWNER') {
    throw new AppError('Chức năng này chỉ dành cho Partner Owner', 403, 'PARTNER_OWNER_REQUIRED');
  }
  return prisma.branch.create({ data: { ...data, partnerId: access.partnerId } });
}

export async function updateBranch(userId, branchId, data) {
  const access = await getPartnerAccessByUserId(userId);
  if (access.role !== 'OWNER') {
    throw new AppError('Chức năng này chỉ dành cho Partner Owner', 403, 'PARTNER_OWNER_REQUIRED');
  }
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) throw new AppError('Không tìm thấy chi nhánh', 404, 'BRANCH_NOT_FOUND');
  if (branch.partnerId !== access.partnerId) {
    throw new AppError('Không có quyền thao tác trên chi nhánh này', 403, 'FORBIDDEN');
  }
  return prisma.branch.update({ where: { id: branchId }, data });
}

export async function deleteBranch(userId, branchId) {
  const access = await getPartnerAccessByUserId(userId);
  if (access.role !== 'OWNER') {
    throw new AppError('Chức năng này chỉ dành cho Partner Owner', 403, 'PARTNER_OWNER_REQUIRED');
  }
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      _count: { select: { voucherBranches: true, usageLogs: true, members: true } },
    },
  });
  if (!branch) throw new AppError('Không tìm thấy chi nhánh', 404, 'BRANCH_NOT_FOUND');
  if (branch.partnerId !== access.partnerId) {
    throw new AppError('Không có quyền thao tác trên chi nhánh này', 403, 'FORBIDDEN');
  }
  if (branch._count.voucherBranches > 0 || branch._count.usageLogs > 0 || branch._count.members > 0) {
    throw new AppError(
      'Chi nhánh đang được sử dụng; hãy chuyển sang trạng thái ngưng hoạt động thay vì xóa.',
      409,
      'BRANCH_IN_USE',
    );
  }
  return prisma.branch.delete({ where: { id: branchId } });
}
