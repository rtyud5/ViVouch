import { prisma } from '../../config/prisma.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import { VOUCHER_CODE_STATUS } from '../../constants/statuses.js';
import { AppError } from '../../utils/appError.js';
import * as auditLog from '../auditLogs/auditLog.service.js';

function assertRedeemable(voucherCode, now = new Date()) {
  if (voucherCode.status === VOUCHER_CODE_STATUS.USED) {
    throw new AppError('Mã đã được sử dụng', 400, 'VOUCHER_CODE_USED');
  }

  if (voucherCode.status === VOUCHER_CODE_STATUS.EXPIRED || (voucherCode.expiresAt && voucherCode.expiresAt <= now)) {
    throw new AppError('Mã đã hết hạn', 400, 'VOUCHER_CODE_EXPIRED');
  }

  if (voucherCode.status === VOUCHER_CODE_STATUS.CANCELLED) {
    throw new AppError('Mã đã bị huỷ', 400, 'VOUCHER_CODE_CANCELLED');
  }

  if (voucherCode.status === VOUCHER_CODE_STATUS.LOCKED) {
    throw new AppError('Mã đang bị khoá', 400, 'VOUCHER_CODE_LOCKED');
  }

  if (voucherCode.status !== VOUCHER_CODE_STATUS.ISSUED) {
    throw new AppError('Mã không hợp lệ', 400, 'INVALID_VOUCHER_CODE');
  }
}

async function getPartnerAndVoucherCode(partnerUserId, code, db = prisma) {
  const partner = await db.partner.findUnique({ where: { userId: partnerUserId } });

  if (!partner || partner.status !== 'APPROVED') {
    throw new AppError('Tài khoản đối tác chưa được kích hoạt hoặc đã bị khoá', 403, 'FORBIDDEN');
  }

  const voucherCode = await db.voucherCode.findUnique({
    where: { code },
    include: {
      voucher: { select: { partnerId: true, title: true } },
      owner: { select: { fullName: true } },
    },
  });

  if (!voucherCode) {
    throw new AppError('Mã voucher không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
  }

  if (voucherCode.voucher.partnerId !== partner.id) {
    throw new AppError('Bạn không có quyền xác thực mã này', 403, 'FORBIDDEN');
  }

  return { partner, voucherCode };
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

/**
 * Validates a voucher code without changing its state. This is deliberately
 * separate from confirmation so partner staff can verify the customer and
 * branch before consuming the voucher.
 */
export async function checkCode(partnerUserId, code, branchId) {
  const checkedAt = new Date();
  const { partner, voucherCode } = await getPartnerAndVoucherCode(partnerUserId, code);

  assertRedeemable(voucherCode, checkedAt);
  const branch = await getRedeemBranch(prisma, partner.id, voucherCode.voucherId, branchId);

  return {
    code: voucherCode.code,
    voucherTitle: voucherCode.voucher.title,
    customerName: voucherCode.owner.fullName,
    branchId: branch.id,
    branchName: branch.name,
    expiresAt: voucherCode.expiresAt?.toISOString() ?? null,
    checkedAt: checkedAt.toISOString(),
  };
}

export async function redeemCode(partnerUserId, code, branchId) {
  const { partner, voucherCode } = await getPartnerAndVoucherCode(partnerUserId, code);

  assertRedeemable(voucherCode);

  let redeemedAt;
  let redeemedBranch;

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "VoucherCode" WHERE id = ${voucherCode.id} FOR UPDATE`;

    redeemedAt = new Date();

    const lockedVoucherCode = await tx.voucherCode.findUnique({
      where: { id: voucherCode.id },
      select: { id: true, status: true, expiresAt: true },
    });

    if (!lockedVoucherCode) {
      throw new AppError('Mã voucher không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
    }

    assertRedeemable(lockedVoucherCode, redeemedAt);

    redeemedBranch = await getRedeemBranch(tx, partner.id, voucherCode.voucherId, branchId);

    const updated = await tx.voucherCode.updateMany({
      where: {
        id: voucherCode.id,
        status: VOUCHER_CODE_STATUS.ISSUED,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: redeemedAt } },
        ],
      },
      data: {
        status: VOUCHER_CODE_STATUS.USED,
        usedAt: redeemedAt,
      },
    });

    if (updated.count === 0) {
      throw new AppError('Mã đã được sử dụng', 400, 'VOUCHER_CODE_USED');
    }

    await tx.voucherUsageLog.create({
      data: {
        voucherCodeId: voucherCode.id,
        redeemedBy: partner.userId,
        branchId: redeemedBranch.id,
        redeemedAt,
      },
    });

    await auditLog.log(partner.userId, AUDIT_ACTIONS.PARTNER_REDEEM_VOUCHER, 'VoucherCode', voucherCode.id, {
      code: voucherCode.code,
      branchId: redeemedBranch.id,
      redeemedAt,
      oldValues: { status: VOUCHER_CODE_STATUS.ISSUED },
      newValues: { status: VOUCHER_CODE_STATUS.USED, usedAt: redeemedAt },
    }, tx);
  }, {
    timeout: 10000,
  });

  return {
    voucherTitle: voucherCode.voucher.title,
    customerName: voucherCode.owner.fullName,
    branchId: redeemedBranch.id,
    branchName: redeemedBranch.name,
    redeemedAt: redeemedAt.toISOString(),
  };
}

export const confirmCode = redeemCode;
