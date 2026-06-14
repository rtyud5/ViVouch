import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { canTransition } from '../../utils/stateMachine.js';
import * as auditLog from '../auditLogs/auditLog.service.js';

const VOUCHER_TRANSITIONS = {
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
};

function assertPartnerActionAllowed(partner, adminId) {
  if (!partner) {
    throw new AppError('Partner not found', 404, 'PARTNER_NOT_FOUND');
  }
  if (partner.userId === adminId) {
    throw new AppError('Cannot approve or reject your own partner account', 400, 'SELF_ACTION');
  }
  if (partner.status !== 'PENDING') {
    throw new AppError('Partner must be in PENDING status', 400, 'INVALID_STATUS');
  }
}

export async function approvePartner(adminId, partnerId) {
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  assertPartnerActionAllowed(partner, adminId);

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPartner = await tx.partner.update({
      where: { id: partnerId },
      data: { status: 'APPROVED' },
    });

    await tx.user.update({
      where: { id: partner.userId },
      data: { role: 'PARTNER' },
    });

    return updatedPartner;
  });

  await auditLog.log(adminId, 'APPROVE_PARTNER', 'Partner', partnerId);

  return updated;
}

export async function rejectPartner(adminId, partnerId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('Reason is required', 400, 'MISSING_REASON');
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  assertPartnerActionAllowed(partner, adminId);

  const updated = await prisma.partner.update({
    where: { id: partnerId },
    data: { status: 'REJECTED', rejectReason: reason.trim() },
  });

  await auditLog.log(adminId, 'REJECT_PARTNER', 'Partner', partnerId, { reason: reason.trim() });

  return updated;
}

export async function approveVoucher(adminId, voucherId) {
  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });

  if (!voucher) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  if (!canTransition(voucher.status, 'APPROVED', VOUCHER_TRANSITIONS)) {
    throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
  }

  const updated = await prisma.voucher.update({
    where: { id: voucherId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });

  await auditLog.log(adminId, 'APPROVE_VOUCHER', 'Voucher', voucherId);

  return updated;
}

export async function rejectVoucher(adminId, voucherId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('Reason is required', 400, 'MISSING_REASON');
  }

  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });

  if (!voucher) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  if (!canTransition(voucher.status, 'REJECTED', VOUCHER_TRANSITIONS)) {
    throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
  }

  const updated = await prisma.voucher.update({
    where: { id: voucherId },
    data: {
      status: 'REJECTED',
      rejectReason: reason.trim(),
    },
  });

  await auditLog.log(adminId, 'REJECT_VOUCHER', 'Voucher', voucherId, { reason: reason.trim() });

  return updated;
}
