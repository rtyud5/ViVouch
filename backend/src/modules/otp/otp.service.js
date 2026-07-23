import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import { sendImmediateEmail } from '../email/email.service.js';
import { generateNumericOtp, hashOtpValue, verifyOtpValue } from './otp.crypto.js';
import { renderOtpEmail } from '../email/email.templates.js';

export function hashOtp(otp) {
  return hashOtpValue(otp, env.OTP_PEPPER);
}

export function verifyOtpHash(otp, hash) {
  return verifyOtpValue(otp, hash, env.OTP_PEPPER);
}

export async function issueOtp({ userId = null, email, fullName, purpose }) {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateNumericOtp();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60_000);

  const record = await prisma.$transaction(async (tx) => {
    // Serialize issue/resend per email + purpose without relying on an in-memory lock.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${normalizedEmail}), hashtext(${purpose}))`;
    const latest = await tx.emailOtp.findFirst({
      where: { email: normalizedEmail, purpose, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      const elapsedSeconds = (Date.now() - latest.createdAt.getTime()) / 1000;
      if (elapsedSeconds < env.OTP_RESEND_SECONDS) {
        throw new AppError(
          `Vui lòng chờ ${Math.ceil(env.OTP_RESEND_SECONDS - elapsedSeconds)} giây trước khi gửi lại OTP`,
          429,
          'OTP_RESEND_TOO_SOON',
        );
      }
    }

    await tx.emailOtp.updateMany({
      where: { email: normalizedEmail, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return tx.emailOtp.create({
      data: { userId, email: normalizedEmail, purpose, codeHash: hashOtp(otp), expiresAt },
    });
  });

  try {
    await sendImmediateEmail({
      to: normalizedEmail,
      ...renderOtpEmail({ fullName, otp, purpose, expiresMinutes: env.OTP_EXPIRES_MINUTES }),
    });
  } catch (error) {
    await prisma.emailOtp.delete({ where: { id: record.id } }).catch(() => {});
    throw new AppError('Không thể gửi email OTP. Vui lòng thử lại sau.', 503, 'EMAIL_DELIVERY_FAILED');
  }

  return { expiresAt, resendAfterSeconds: env.OTP_RESEND_SECONDS };
}

async function consumeOtpWithDb(db, { email, purpose, otp }) {
  const normalizedEmail = email.trim().toLowerCase();
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${normalizedEmail}), hashtext(${purpose}))`;
  const record = await db.emailOtp.findFirst({
    where: { email: normalizedEmail, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw new AppError('Mã OTP không hợp lệ hoặc đã được sử dụng', 400, 'OTP_INVALID');
  if (record.expiresAt <= new Date()) {
    await db.emailOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    throw new AppError('Mã OTP đã hết hạn', 400, 'OTP_EXPIRED');
  }
  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError('Mã OTP đã bị khóa do nhập sai quá nhiều lần', 429, 'OTP_ATTEMPTS_EXCEEDED');
  }
  if (!verifyOtpHash(otp, record.codeHash)) {
    await db.emailOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new AppError('Mã OTP không chính xác', 400, 'OTP_INVALID');
  }
  const consumed = await db.emailOtp.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) throw new AppError('Mã OTP đã được sử dụng', 409, 'OTP_ALREADY_USED');
  return record;
}

export function consumeOtp(input, db = prisma) {
  if (db === prisma) {
    return prisma.$transaction((tx) => consumeOtpWithDb(tx, input));
  }
  return consumeOtpWithDb(db, input);
}
