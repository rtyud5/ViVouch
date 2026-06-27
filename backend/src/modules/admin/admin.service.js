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
  // Check if the Partner owner (partner.userId) is the same as the admin performing the action.
  // This prevents an admin who also registered as a partner from approving/rejecting their own application.
  if (partner.userId === adminId) {
    throw new AppError('Cannot approve or reject your own partner account', 400, 'SELF_ACTION');
  }
  if (partner.status !== 'PENDING') {
    throw new AppError(
      `Partner is currently in ${partner.status} status — only PENDING partners can be approved or rejected`,
      400,
      'INVALID_STATUS',
    );
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

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);

  const [totalUsers, activePartners, revenueResult, ordersToday] = await prisma.$transaction([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.partner.count({ where: { status: 'APPROVED' } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
        status: 'PAID',
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
  ]);

  const revenueThisMonth = Number(revenueResult._sum.amount?.toString() ?? '0');

  return { totalUsers, activePartners, revenueThisMonth, ordersToday };
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

export async function findManyPartners(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { status, search } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { representativeName: { contains: search, mode: 'insensitive' } },
      { taxCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    }),
    prisma.partner.count({ where }),
  ]);

  return {
    partners,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findManyVouchers(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { status, search } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, businessName: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.voucher.count({ where }),
  ]);

  return {
    vouchers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findManyUsers(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { role, isLocked, search } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (role) where.role = role;
  if (isLocked !== undefined) {
    const lockedBool = isLocked === 'true' || isLocked === true;
    where.status = lockedBool ? 'LOCKED' : 'ACTIVE';
  }
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { fullName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Map users to include isLocked for frontend compatibility
  const mappedUsers = users.map(u => ({
    ...u,
    isLocked: u.status === 'LOCKED'
  }));

  return {
    users: mappedUsers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function toggleUserLock(adminId, userId) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.id === adminId) {
      throw new AppError('Cannot toggle your own lock status', 400, 'SELF_ACTION');
    }

    const isCurrentLocked = user.status === 'LOCKED';
    const newStatus = isCurrentLocked ? 'ACTIVE' : 'LOCKED';
    const newLockedState = !isCurrentLocked;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    await auditLog.log(
      adminId,
      newLockedState ? AUDIT_ACTIONS.ADMIN_LOCK_USER : AUDIT_ACTIONS.ADMIN_UNLOCK_USER,
      'User',
      userId,
      { previousState: user.status, newState: newStatus },
      tx,
    );

    return { id: updatedUser.id, email: updatedUser.email, isLocked: newLockedState };
  });
}

export async function findManyOrders(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { status, search } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            voucher: { select: { id: true, title: true } },
          },
        },
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findOrderById(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          voucher: { select: { id: true, title: true } },
        },
      },
      voucherCodes: true,
      user: { select: { id: true, email: true, fullName: true, phone: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  return order;
}

export async function findManyAuditLogs(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { action, targetType } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
