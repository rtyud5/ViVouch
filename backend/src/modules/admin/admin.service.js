import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { canTransition } from '../../utils/stateMachine.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import * as auditLog from '../auditLogs/auditLog.service.js';
import { notify } from '../notifications/notifications.service.js';

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
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { user: { select: { email: true } } },
  });
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
      await notify({
        userId: partner.userId,
        type: 'PARTNER_APPROVED',
        title: 'Hồ sơ đối tác đã được duyệt',
        message: 'Bạn có thể sử dụng đầy đủ Partner Portal.',
        referenceType: 'PARTNER',
        referenceId: partnerId,
        email: partner.user.email,
        emailTemplate: 'PARTNER_RESULT',
        emailPayload: { status: 'APPROVED' },
      }, tx);

      return updatedPartner;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError(
        'Partner status has changed — only PENDING partners can be approved or rejected',
        400,
        'INVALID_STATUS',
      );
    }
    throw error;
  }
}

export async function rejectPartner(adminId, partnerId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('Reason is required', 400, 'MISSING_REASON');
  }

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    include: { user: { select: { email: true } } },
  });
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
      await notify({
        userId: partner.userId,
        type: 'PARTNER_REJECTED',
        title: 'Hồ sơ đối tác chưa được duyệt',
        message: trimmedReason,
        referenceType: 'PARTNER',
        referenceId: partnerId,
        email: partner.user.email,
        emailTemplate: 'PARTNER_RESULT',
        emailPayload: { status: 'REJECTED', reason: trimmedReason },
      }, tx);

      return updatedPartner;
    });
  } catch (error) {
    if (isRecordNotFound(error)) {
      throw new AppError(
        'Partner status has changed — only PENDING partners can be approved or rejected',
        400,
        'INVALID_STATUS',
      );
    }
    throw error;
  }
}

export async function approveVoucher(adminId, voucherId) {
  const voucher = await prisma.voucher.findUnique({
    where: { id: voucherId },
    include: { partner: { include: { user: { select: { id: true, email: true } } } } },
  });

  if (!voucher) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  if (!canTransition(voucher.status, 'APPROVED', VOUCHER_TRANSITIONS)) {
    throw new AppError('Invalid status transition', 400, 'INVALID_TRANSITION');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const canGoOnSale = voucher.saleStart
        && voucher.saleEnd
        && voucher.saleStart <= voucher.saleEnd
        && voucher.saleStart <= now
        && voucher.saleEnd >= now
        && voucher.soldQty < voucher.totalQty;

      let updatedVoucher = await tx.voucher.update({
        where: { id: voucherId, status: 'PENDING_APPROVAL' },
        data: {
          status: 'APPROVED',
          approvedAt: now,
          approvedBy: adminId,
        },
      });

      if (canGoOnSale) {
        updatedVoucher = await tx.voucher.update({
          where: { id: voucherId, status: 'APPROVED' },
          data: { status: 'ON_SALE' },
        });
      }

      await auditLog.log(
        adminId,
        AUDIT_ACTIONS.ADMIN_APPROVE_VOUCHER,
        'Voucher',
        voucherId,
        { published: canGoOnSale },
        tx,
      );
      await notify({
        userId: voucher.partner.user.id,
        type: 'VOUCHER_APPROVED',
        title: 'Voucher đã được duyệt',
        message: `Voucher ${voucher.title} đã được duyệt.`,
        referenceType: 'VOUCHER',
        referenceId: voucherId,
        email: voucher.partner.user.email,
        emailTemplate: 'VOUCHER_RESULT',
        emailPayload: { status: 'APPROVED', title: voucher.title },
      }, tx);

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

  const rangeDays = 30;
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - rangeDays + 1, 0, 0, 0);

  const [totalUsers, activePartners, revenueResult, ordersToday, paymentsLast30Days] = await prisma.$transaction([
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
    prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'PAID',
      },
      select: { amount: true, createdAt: true },
    })
  ]);

  const revenueThisMonth = Number(revenueResult._sum.amount?.toString() ?? '0');

  const pad = (n) => n.toString().padStart(2, '0');
  const formatDateForChart = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  const dailyDataMap = new Map();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dailyDataMap.set(formatDateForChart(d), 0);
  }

  for (const payment of paymentsLast30Days) {
    const dateStr = formatDateForChart(payment.createdAt);
    if (dailyDataMap.has(dateStr)) {
      dailyDataMap.set(dateStr, dailyDataMap.get(dateStr) + Number(payment.amount.toString()));
    }
  }

  const revenueByDay = Array.from(dailyDataMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return { totalUsers, activePartners, revenueThisMonth, ordersToday, revenueByDay };
}

export async function rejectVoucher(adminId, voucherId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('Reason is required', 400, 'MISSING_REASON');
  }

  const voucher = await prisma.voucher.findUnique({
    where: { id: voucherId },
    include: { partner: { include: { user: { select: { id: true, email: true } } } } },
  });

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
      await notify({
        userId: voucher.partner.user.id,
        type: 'VOUCHER_REJECTED',
        title: 'Voucher bị từ chối',
        message: trimmedReason,
        referenceType: 'VOUCHER',
        referenceId: voucherId,
        email: voucher.partner.user.email,
        emailTemplate: 'VOUCHER_RESULT',
        emailPayload: { status: 'REJECTED', title: voucher.title, reason: trimmedReason },
      }, tx);

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
      { id: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
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
        wallet: { select: { balance: true } },
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


export async function adjustWallet(adminId, userId, { amount, note }) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    if (user.role !== 'CUSTOMER') throw new AppError('Ví demo chỉ áp dụng cho Customer', 409, 'WALLET_CUSTOMER_ONLY');

    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
    await tx.$queryRaw`SELECT id FROM "Wallet" WHERE id = ${wallet.id} FOR UPDATE`;
    wallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
    const before = Number(wallet.balance);
    const after = before + amount;
    if (after < 0) throw new AppError('Số dư sau điều chỉnh không được âm', 409, 'WALLET_NEGATIVE_BALANCE');

    const updated = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: after } });
    await tx.walletTransaction.create({
      data: { walletId: wallet.id, type: 'ADMIN_ADJUSTMENT', amount: Math.abs(amount), balanceBefore: before, balanceAfter: after, note },
    });
    await auditLog.log(adminId, AUDIT_ACTIONS.ADMIN_ADJUST_WALLET, 'Wallet', wallet.id, {
      userId, amount, note, oldValues: { balance: before }, newValues: { balance: after },
    }, tx);
    return { userId, balance: Number(updated.balance) };
  });
}

export async function assignUserRole(adminId, userId, role) {
  if (adminId === userId) {
    throw new AppError('Cannot change your own role', 400, 'SELF_ACTION');
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { partner: { select: { id: true, status: true } } },
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    if (role === 'PARTNER' && user.partner?.status !== 'APPROVED') {
      throw new AppError('User must have an approved partner profile before receiving PARTNER role', 409, 'PARTNER_PROFILE_REQUIRED');
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });

    await tx.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    await auditLog.log(adminId, AUDIT_ACTIONS.ADMIN_ASSIGN_ROLE, 'User', userId, {
      previousRole: user.role,
      newRole: role,
    }, tx);
    return updated;
  });
}

export async function setPartnerStatus(adminId, partnerId, status, reason) {
  return prisma.$transaction(async (tx) => {
    const partner = await tx.partner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new AppError('Partner not found', 404, 'PARTNER_NOT_FOUND');
    if (!['APPROVED', 'SUSPENDED'].includes(partner.status) || partner.status === status) {
      throw new AppError('Partner status transition is not allowed', 400, 'INVALID_STATUS');
    }
    if (status === 'SUSPENDED' && !reason?.trim()) {
      throw new AppError('Reason is required when suspending a partner', 400, 'MISSING_REASON');
    }

    const updated = await tx.partner.update({
      where: { id: partnerId },
      data: { status, rejectReason: status === 'SUSPENDED' ? reason.trim() : null },
    });
    await auditLog.log(
      adminId,
      status === 'SUSPENDED' ? AUDIT_ACTIONS.ADMIN_SUSPEND_PARTNER : AUDIT_ACTIONS.ADMIN_REACTIVATE_PARTNER,
      'Partner',
      partnerId,
      { previousStatus: partner.status, newStatus: status, reason: reason?.trim() || null },
      tx,
    );
    return updated;
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

export async function cancelOrder(adminId, orderId, reason) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
    await tx.$queryRaw`
      SELECT id FROM "VoucherCode"
      WHERE "orderId" = ${orderId}
      ORDER BY id
      FOR UPDATE
    `;
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        voucherCodes: true,
        user: { select: { id: true, email: true } },
      },
    });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.status === 'CANCELLED') throw new AppError('Order is already cancelled', 409, 'ORDER_ALREADY_CANCELLED');
    if (order.status === 'REFUND_PENDING' || order.status === 'REFUNDED') {
      throw new AppError('Order is already in the refund workflow', 409, 'ORDER_REFUND_IN_PROGRESS');
    }
    if (order.voucherCodes.some((code) => code.status === 'USED')) {
      throw new AppError('Cannot cancel an order containing a used voucher', 409, 'ORDER_HAS_USED_VOUCHER');
    }
    if (order.payment?.status === 'PAID' && order.payment.method === 'PAYOS') {
      throw new AppError(
        'Đơn payOS đã thanh toán phải được xử lý qua quy trình hoàn tiền thủ công',
        409,
        'USE_REFUND_WORKFLOW',
      );
    }

    let refundedAmount = 0;
    if (order.payment?.status === 'PAID' && order.payment.method === 'VIVOUCH_WALLET') {
      await tx.$queryRaw`SELECT id FROM "Wallet" WHERE "userId" = ${order.userId} FOR UPDATE`;
      const wallet = await tx.wallet.findUnique({ where: { userId: order.userId } });
      if (!wallet) throw new AppError('Không tìm thấy Ví ViVouch', 404, 'WALLET_NOT_FOUND');
      refundedAmount = Number(order.payment.amount);
      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + refundedAmount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          orderId,
          type: 'REFUND',
          amount: refundedAmount,
          balanceBefore,
          balanceAfter,
          note: `Admin hủy và hoàn tiền đơn ${orderId}`,
        },
      });
      await tx.payment.update({ where: { orderId }, data: { status: 'REFUNDED' } });
    } else if (order.payment?.status === 'PENDING') {
      await tx.payment.update({
        where: { orderId },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    await tx.voucherCode.updateMany({
      where: { orderId, status: { in: ['ISSUED', 'LOCKED'] } },
      data: { status: 'CANCELLED' },
    });

    for (const item of order.items) {
      await tx.$executeRaw`
        UPDATE "Voucher"
        SET "soldQty" = GREATEST(0, "soldQty" - ${item.qty}),
            "updatedAt" = NOW()
        WHERE id = ${item.voucherId}
      `;
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { payment: true, voucherCodes: true },
    });
    await auditLog.log(adminId, AUDIT_ACTIONS.ADMIN_CANCEL_ORDER, 'Order', orderId, {
      previousStatus: order.status,
      reason,
      refunded: refundedAmount > 0,
      refundedAmount,
      paymentMethod: order.payment?.method || null,
    }, tx);
    await notify({
      userId: order.userId,
      type: 'REFUND_RESOLVED',
      title: 'Đơn hàng đã được hủy',
      message: refundedAmount > 0
        ? `Đơn ${orderId} đã được hủy và ${refundedAmount.toLocaleString('vi-VN')}đ đã hoàn về Ví ViVouch.`
        : `Đơn ${orderId} đã được hủy.`,
      referenceType: 'ORDER',
      referenceId: orderId,
      email: order.user.email,
      emailTemplate: 'REFUND_RESOLVED',
      emailPayload: {
        orderId,
        status: refundedAmount > 0 ? 'ĐÃ HỦY VÀ HOÀN VÍ' : 'ĐÃ HỦY',
        adminNote: reason,
      },
    }, tx);
    return updated;
  }, { timeout: 10000 });
}

export async function findManyAuditLogs(filters = {}, pagination = { page: 1, limit: 10 }) {
  const { page = 1, limit = 10 } = pagination;
  const { action, targetType, actorId, dateFrom, dateTo } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (actorId) where.actorId = actorId;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: new Date(dateTo.getTime() + 86_399_999) } : {}),
    };
  }

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
