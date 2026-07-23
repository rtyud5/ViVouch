import { prisma } from '../../config/prisma.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import { VOUCHER_CODE_STATUS } from '../../constants/statuses.js';
import { AppError } from '../../utils/appError.js';
import * as auditLog from '../auditLogs/auditLog.service.js';

function assertRedeemable(voucherCode, now = new Date()) {
  const statusErrors = {
    [VOUCHER_CODE_STATUS.USED]: ['Mã đã được sử dụng', 'VOUCHER_CODE_USED'],
    [VOUCHER_CODE_STATUS.EXPIRED]: ['Mã đã hết hạn', 'VOUCHER_CODE_EXPIRED'],
    [VOUCHER_CODE_STATUS.CANCELLED]: ['Mã đã bị huỷ', 'VOUCHER_CODE_CANCELLED'],
    [VOUCHER_CODE_STATUS.LOCKED]: ['Mã đang bị khoá', 'VOUCHER_CODE_LOCKED'],
    [VOUCHER_CODE_STATUS.REFUND_PENDING]: ['Mã đang chờ hoàn tiền', 'VOUCHER_CODE_REFUND_PENDING'],
    [VOUCHER_CODE_STATUS.REFUNDED]: ['Mã đã được hoàn tiền', 'VOUCHER_CODE_REFUNDED'],
  };
  const mapped = statusErrors[voucherCode.status];
  if (mapped) throw new AppError(mapped[0], 400, mapped[1]);
  if (voucherCode.expiresAt && voucherCode.expiresAt <= now) {
    throw new AppError('Mã đã hết hạn', 400, 'VOUCHER_CODE_EXPIRED');
  }
  if (voucherCode.status !== VOUCHER_CODE_STATUS.ISSUED) {
    throw new AppError('Mã không hợp lệ', 400, 'INVALID_VOUCHER_CODE');
  }
}

function assertAccess(access, branchId) {
  if (!access || access.status !== 'ACTIVE' || access.partner.status !== 'APPROVED') {
    throw new AppError('Tài khoản đối tác chưa được kích hoạt hoặc đã bị khoá', 403, 'PARTNER_NOT_ACTIVE');
  }
  if (access.role === 'STAFF' && access.branchId !== branchId) {
    throw new AppError('Nhân viên chỉ được redeem tại chi nhánh được phân công', 403, 'INVALID_BRANCH_SCOPE');
  }
}

async function getVoucherCode(access, code, db = prisma) {
  const voucherCode = await db.voucherCode.findUnique({
    where: { code },
    include: {
      voucher: { select: { partnerId: true, title: true } },
      owner: { select: { fullName: true } },
    },
  });
  if (!voucherCode) throw new AppError('Mã voucher không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
  if (voucherCode.voucher.partnerId !== access.partnerId) {
    throw new AppError('Bạn không có quyền xác thực mã này', 403, 'FORBIDDEN');
  }
  return voucherCode;
}

async function getRedeemBranch(db, partnerId, voucherId, branchId) {
  const branch = await db.branch.findFirst({
    where: {
      id: branchId,
      partnerId,
      isActive: true,
      voucherBranches: { some: { voucherId } },
    },
    select: { id: true, name: true },
  });
  if (!branch) {
    throw new AppError(
      'Chi nhánh không hoạt động hoặc voucher không áp dụng tại chi nhánh này',
      403,
      'INVALID_BRANCH_SCOPE',
    );
  }
  return branch;
}

export async function checkCode(actorId, access, code, branchId) {
  assertAccess(access, branchId);
  const checkedAt = new Date();
  const voucherCode = await getVoucherCode(access, code);
  assertRedeemable(voucherCode, checkedAt);
  const branch = await getRedeemBranch(prisma, access.partnerId, voucherCode.voucherId, branchId);
  return {
    code: voucherCode.code,
    voucherTitle: voucherCode.voucher.title,
    customerName: voucherCode.owner.fullName,
    branchId: branch.id,
    branchName: branch.name,
    expiresAt: voucherCode.expiresAt?.toISOString() ?? null,
    checkedAt: checkedAt.toISOString(),
    checkedBy: actorId,
  };
}

export async function redeemCode(actorId, access, code, branchId) {
  assertAccess(access, branchId);
  const initial = await getVoucherCode(access, code);
  assertRedeemable(initial);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "VoucherCode" WHERE id = ${initial.id} FOR UPDATE`;
    const redeemedAt = new Date();
    const locked = await tx.voucherCode.findUnique({
      where: { id: initial.id },
      include: {
        voucher: { select: { partnerId: true, title: true } },
        owner: { select: { fullName: true } },
      },
    });
    if (!locked) throw new AppError('Mã voucher không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
    assertRedeemable(locked, redeemedAt);
    const branch = await getRedeemBranch(tx, access.partnerId, locked.voucherId, branchId);

    const updated = await tx.voucherCode.updateMany({
      where: {
        id: locked.id,
        status: VOUCHER_CODE_STATUS.ISSUED,
        OR: [{ expiresAt: null }, { expiresAt: { gt: redeemedAt } }],
      },
      data: { status: VOUCHER_CODE_STATUS.USED, usedAt: redeemedAt },
    });
    if (updated.count !== 1) {
      throw new AppError('Mã đã được sử dụng', 409, 'VOUCHER_CODE_USED');
    }

    await tx.voucherUsageLog.create({
      data: { voucherCodeId: locked.id, redeemedBy: actorId, branchId: branch.id, redeemedAt },
    });
    await auditLog.log(actorId, AUDIT_ACTIONS.PARTNER_REDEEM_VOUCHER, 'VoucherCode', locked.id, {
      branchId: branch.id,
      oldValues: { status: VOUCHER_CODE_STATUS.ISSUED },
      newValues: { status: VOUCHER_CODE_STATUS.USED, usedAt: redeemedAt },
    }, tx);

    return {
      voucherTitle: locked.voucher.title,
      customerName: locked.owner.fullName,
      branchId: branch.id,
      branchName: branch.name,
      redeemedAt: redeemedAt.toISOString(),
    };
  }, { timeout: 10000 });
}

export const confirmCode = redeemCode;
