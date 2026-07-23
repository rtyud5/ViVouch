import { getPartnerAccessByUserId } from '../modules/partners/partners.service.js';
import { AppError } from '../utils/appError.js';

async function loadAccess(userId) {
  try {
    return await getPartnerAccessByUserId(userId, { includeInactive: true });
  } catch (error) {
    if (error instanceof AppError && error.code === 'PARTNER_NOT_FOUND') return null;
    throw error;
  }
}

function assertActivePartner(access, requireApproved) {
  if (access.status !== 'ACTIVE') {
    throw new AppError(
      'Tài khoản thành viên đối tác chưa được kích hoạt',
      403,
      'PARTNER_MEMBER_INACTIVE',
    );
  }
  if (requireApproved && access.partner.status !== 'APPROVED') {
    throw new AppError(
      'Đối tác chưa được duyệt hoặc đang bị tạm ngưng',
      403,
      'PARTNER_NOT_ACTIVE',
    );
  }
}

export function requirePartnerMember({ requireApproved = true } = {}) {
  return async (req, res, next) => {
    try {
      const access = await loadAccess(req.user.userId);
      if (!access) {
        throw new AppError(
          'Không tìm thấy quyền thành viên đối tác',
          403,
          'PARTNER_MEMBER_REQUIRED',
        );
      }
      assertActivePartner(access, requireApproved);
      req.partnerAccess = access;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function requirePartnerOwner({ requireApproved = true } = {}) {
  return async (req, res, next) => {
    try {
      const access = await loadAccess(req.user.userId);
      if (!access || access.role !== 'OWNER') {
        throw new AppError(
          'Chức năng này chỉ dành cho Partner Owner',
          403,
          'PARTNER_OWNER_REQUIRED',
        );
      }
      assertActivePartner(access, requireApproved);
      req.partnerAccess = access;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
