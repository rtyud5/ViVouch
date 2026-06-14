import { prisma } from '../../config/prisma.js';

export async function log(actorId, action, targetType, targetId, metadata = {}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata,
    },
  });
}
