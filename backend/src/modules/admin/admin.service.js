import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { canTransition } from '../../utils/stateMachine.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import * as auditLog from '../auditLogs/auditLog.service.js';

const VOUCHER_TRANSITIONS = {
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
};

function isRecordNotFound(error) {
  return error?.code === 'P2025';
}

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

  try {
    return await prisma.$transaction(async (tx) => {
      const updatedPartner = await tx.partner.update({
        where: { id: partnerId, status: 'PENDING' },
        data: { status: 'APPROVED' },
      });

      await tx.user.update({
        where: { id: partner.userId },
        data: { role: 'PARTNER' },
      });

      await auditLog.log(
        adminId,
        AUDIT_ACTIONS.ADMIN_APPROVE_PARTNER,
        'Partner',
        partnerId,
        {},
        tx,
      );

      return updatedPartner;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError('Partner must be in PENDING status', 400, 'INVALID_STATUS');
    }
    throw error;
  }
}

export async function rejectPartner(adminId, partnerId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('Reason is required', 400, 'MISSING_REASON');
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  assertPartnerActionAllowed(partner, adminId);

  const trimmedReason = reason.trim();

  try {
    return await prisma.$transaction(async (tx) => {
      const updatedPartner = await tx.partner.update({
        where: { id: partnerId, status: 'PENDING' },
        data: { status: 'REJECTED', rejectReason: trimmedReason },
      });

      await auditLog.log(
        adminId,
        AUDIT_ACTIONS.ADMIN_REJECT_PARTNER,
        'Partner',
        partnerId,
        { reason: trimmedReason },
        tx,
      );

      return updatedPartner;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError('Partner must be in PENDING status', 400, 'INVALID_STATUS');
    }
    throw error;
  }
}

export async function approveVoucher(adminId, voucherId) {
  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });

  if (!voucher) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  if (!canTransition(voucher.status, 'APPROVED', VOUCHER_TRANSITIONS)) {
    throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const updatedVoucher = await tx.voucher.update({
        where: { id: voucherId, status: 'PENDING_APPROVAL' },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });

      await auditLog.log(
        adminId,
        AUDIT_ACTIONS.ADMIN_APPROVE_VOUCHER,
        'Voucher',
        voucherId,
        {},
        tx,
      );

      return updatedVoucher;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
    }
    throw error;
  }
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

  const trimmedReason = reason.trim();

  try {
    return await prisma.$transaction(async (tx) => {
      const updatedVoucher = await tx.voucher.update({
        where: { id: voucherId, status: 'PENDING_APPROVAL' },
        data: {
          status: 'REJECTED',
          rejectReason: trimmedReason,
        },
      });

      await auditLog.log(
        adminId,
        AUDIT_ACTIONS.ADMIN_REJECT_VOUCHER,
        'Voucher',
        voucherId,
        { reason: trimmedReason },
        tx,
      );

      return updatedVoucher;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
    }
    throw error;
  }
}
