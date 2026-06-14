import { prisma } from '../../config/prisma.js';

export async function log(actorId, action, targetType, targetId, metadata = {}, db = prisma) {
  return db.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata,
    },
  });
}
