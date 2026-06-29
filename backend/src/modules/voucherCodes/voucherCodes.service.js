import { prisma } from '../../config/prisma.js';
import { VOUCHER_CODE_STATUS } from '../../constants/statuses.js';
import { AppError } from '../../utils/appError.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';

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

export async function redeemCode(partnerUserId, code) {
  const partner = await prisma.partner.findUnique({ where: { userId: partnerUserId } });

  if (!partner || partner.status !== 'APPROVED') {
    throw new AppError('Tài khoản đối tác chưa được kích hoạt hoặc đã bị khoá', 403, 'FORBIDDEN');
  }

  const voucherCode = await prisma.voucherCode.findUnique({
    where: { code },
    include: {
      voucher: { select: { partnerId: true, title: true } },
      owner: { select: { fullName: true } },
    },
  });

  if (!voucherCode) {
    throw new AppError('Mã không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
  }

  if (voucherCode.voucher.partnerId !== partner.id) {
    throw new AppError('Mã không thuộc partner này', 403, 'FORBIDDEN');
  }

  assertRedeemable(voucherCode);

  const redeemedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "VoucherCode" WHERE id = ${voucherCode.id}::uuid FOR UPDATE`;

    const lockedVoucherCode = await tx.voucherCode.findUnique({
      where: { id: voucherCode.id },
      select: { id: true, status: true, expiresAt: true },
    });

    if (!lockedVoucherCode) {
      throw new AppError('Mã không tồn tại', 404, 'VOUCHER_CODE_NOT_FOUND');
    }

    assertRedeemable(lockedVoucherCode, redeemedAt);

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

    if (updated.count !== 1) {
      throw new AppError('Mã không hợp lệ', 400, 'INVALID_VOUCHER_CODE');
    }

    let branch = await tx.branch.findFirst({
      where: {
        partnerId: partner.id,
        isActive: true,
        voucherBranches: { some: { voucherId: voucherCode.voucherId } },
      },
      select: { id: true },
    });

    if (!branch) {
      branch = await tx.branch.findFirst({
        where: { partnerId: partner.id, isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
    }

    if (!branch) {
      throw new AppError('Partner chưa có chi nhánh hoạt động để ghi nhận đổi mã', 400, 'BRANCH_REQUIRED');
    }

    await tx.voucherUsageLog.create({
      data: {
        voucherCodeId: voucherCode.id,
        redeemedBy: partner.userId,
        branchId: branch.id,
        redeemedAt,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: partner.userId,
        action: AUDIT_ACTIONS.PARTNER_REDEEM_VOUCHER,
        targetType: 'VoucherCode',
        targetId: voucherCode.id,
        metadata: {
          code: voucherCode.code,
          branchId: branch.id,
          redeemedAt,
        },
      },
    });
  });

  return {
    voucherTitle: voucherCode.voucher.title,
    customerName: voucherCode.owner.fullName,
    redeemedAt,
  };
}
