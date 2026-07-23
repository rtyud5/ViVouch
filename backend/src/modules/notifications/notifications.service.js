import { prisma } from '../../config/prisma.js';
import { queueEmail } from '../email/email.service.js';

export async function notify({ userId, type, title, message, referenceType = null, referenceId = null, email = null, emailTemplate = null, emailPayload = null }, db = prisma) {
  const notification = await db.notification.create({
    data: { userId, type, title, message, referenceType, referenceId },
  });
  if (email && emailTemplate) {
    await queueEmail({ userId, recipient: email, template: emailTemplate, payload: emailPayload || {} }, db);
  }
  return notification;
}

export function listForUser(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  return Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]).then(([notifications, total, unread]) => ({ notifications, total, unread, page, limit, totalPages: Math.ceil(total / limit) }));
}

export async function markRead(userId, notificationId) {
  const result = await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
  return result.count === 1;
}

export async function markAllRead(userId) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
