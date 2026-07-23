import { prisma } from '../../config/prisma.js';
import { getRequestContext } from '../../middlewares/requestContext.middleware.js';

export async function log(actorId, action, targetType, targetId, metadata = {}, db = prisma) {
  const context = getRequestContext();
  const oldValues = metadata.oldValues
    || (metadata.previousState !== undefined ? { state: metadata.previousState } : null)
    || (metadata.previousStatus !== undefined ? { status: metadata.previousStatus } : null)
    || (metadata.previousRole !== undefined ? { role: metadata.previousRole } : null);
  const newValues = metadata.newValues
    || (metadata.newState !== undefined ? { state: metadata.newState } : null)
    || (metadata.newStatus !== undefined ? { status: metadata.newStatus } : null)
    || (metadata.newRole !== undefined ? { role: metadata.newRole } : null);

  return db.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata,
      requestId: context.requestId || null,
      ...(oldValues ? { oldValues } : {}),
      ...(newValues ? { newValues } : {}),
      ipAddress: context.ipAddress || null,
      userAgent: context.userAgent || null,
    },
  });
}
