import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { notify } from '../notifications/notifications.service.js';
import { log as auditLog } from '../auditLogs/auditLog.service.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';

export async function createTicket(userId, data) {
  if (data.orderId) {
    const order = await prisma.order.findFirst({ where: { id: data.orderId, userId }, select: { id: true } });
    if (!order) throw new AppError('Đơn hàng không thuộc tài khoản', 403, 'ORDER_ACCESS_DENIED');
  }
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.create({ data: { userId, ...data, orderId: data.orderId || null } });
    await auditLog(userId, AUDIT_ACTIONS.CUSTOMER_CREATE_TICKET, 'SupportTicket', ticket.id, { type: ticket.type }, tx);
    return ticket;
  });
}

export function listMine(userId) {
  return prisma.supportTicket.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function listAdmin({ status, page = 1, limit = 20 } = {}) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: { user: { select: { id: true, email: true, fullName: true } }, order: { select: { id: true, status: true } } },
      orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function respond(adminId, ticketId, data) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: { select: { email: true } } },
    });
    if (!ticket) throw new AppError('Không tìm thấy yêu cầu hỗ trợ', 404, 'TICKET_NOT_FOUND');
    const resolved = ['RESOLVED', 'REJECTED'].includes(data.status);
    const updated = await tx.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: data.status,
        adminResponse: data.adminResponse,
        resolvedBy: resolved ? adminId : null,
        resolvedAt: resolved ? new Date() : null,
      },
    });
    await notify({
      userId: ticket.userId,
      type: 'TICKET_RESPONDED',
      title: 'Yêu cầu hỗ trợ đã được phản hồi',
      message: data.adminResponse,
      referenceType: 'TICKET',
      referenceId: ticket.id,
      email: ticket.user.email,
      emailTemplate: 'TICKET_RESPONDED',
      emailPayload: { subject: ticket.subject, response: data.adminResponse },
    }, tx);
    await auditLog(adminId, AUDIT_ACTIONS.ADMIN_RESPOND_TICKET, 'SupportTicket', ticketId, {
      oldValues: { status: ticket.status }, newValues: { status: data.status },
    }, tx);
    return updated;
  });
}
