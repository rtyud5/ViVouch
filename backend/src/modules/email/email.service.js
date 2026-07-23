import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { sendSmtpEmail } from './smtp.client.js';
import { renderTransactionalEmail } from './email.templates.js';

const testMailbox = [];

function maskEmail(value) {
  const [local = '', domain = ''] = String(value || '').split('@');
  if (!domain) return '[INVALID_EMAIL]';
  return `${local.slice(0, 2)}***@${domain}`;
}

export function getTestMailbox() {
  return [...testMailbox];
}

export function clearTestMailbox() {
  testMailbox.length = 0;
}

export async function sendImmediateEmail(message) {
  if (env.EMAIL_DELIVERY_MODE === 'TEST') {
    testMailbox.push({ ...message, sentAt: new Date() });
    return { mode: 'TEST' };
  }
  if (env.EMAIL_DELIVERY_MODE === 'LOG') {
    logger.info({ recipient: maskEmail(message.to), subject: message.subject }, 'Email delivery simulated');
    return { mode: 'LOG' };
  }
  await sendSmtpEmail(message);
  return { mode: 'SMTP' };
}

export function queueEmail({ userId = null, recipient, template, payload }, db = prisma) {
  const rendered = renderTransactionalEmail(template, payload);
  return db.emailDelivery.create({
    data: {
      userId,
      recipient,
      subject: rendered.subject,
      template,
      payload,
      status: 'PENDING',
    },
  });
}

export async function processEmailOutbox({ limit = 20 } = {}) {
  const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
  const deliveries = await prisma.$transaction(async (tx) => {
    const candidates = await tx.$queryRaw`
      SELECT id
      FROM "EmailDelivery"
      WHERE attempts < 3
        AND (
          status IN ('PENDING'::"EmailDeliveryStatus", 'FAILED'::"EmailDeliveryStatus")
          OR (status = 'PROCESSING'::"EmailDeliveryStatus" AND "updatedAt" < ${staleBefore})
        )
      ORDER BY "createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    `;
    const ids = candidates.map((item) => item.id);
    if (ids.length === 0) return [];
    await tx.emailDelivery.updateMany({
      where: { id: { in: ids } },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });
    return tx.emailDelivery.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'asc' } });
  });

  const result = { processed: deliveries.length, sent: 0, failed: 0 };
  for (const delivery of deliveries) {
    try {
      const rendered = renderTransactionalEmail(delivery.template, delivery.payload);
      await sendImmediateEmail({ to: delivery.recipient, ...rendered });
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: { status: 'SENT', sentAt: new Date(), lastError: null },
      });
      result.sent += 1;
    } catch (error) {
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          lastError: String(error.message || error).slice(0, 500),
        },
      });
      logger.warn({ deliveryId: delivery.id, error: error.message }, 'Email delivery failed');
      result.failed += 1;
    }
  }
  return result;
}
