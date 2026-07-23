import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import { issueOtp } from '../otp/otp.service.js';
import { queueEmail } from '../email/email.service.js';
import { log as auditLog } from '../auditLogs/auditLog.service.js';

export function listStaff(partnerId) {
  return prisma.partnerMember.findMany({
    where: { partnerId, role: 'STAFF' },
    include: {
      user: { select: { id: true, email: true, phone: true, fullName: true, status: true, emailVerifiedAt: true } },
      branch: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createStaff(ownerId, partnerId, data) {
  const [branch, existingUser] = await Promise.all([
    prisma.branch.findFirst({ where: { id: data.branchId, partnerId, isActive: true } }),
    prisma.user.findUnique({ where: { email: data.email } }),
  ]);
  if (!branch) throw new AppError('Chi nhánh không hợp lệ hoặc đã ngưng hoạt động', 400, 'INVALID_BRANCH_SCOPE');
  if (existingUser) throw new AppError('Email đã tồn tại trong hệ thống', 409, 'EMAIL_EXISTS');
  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) throw new AppError('Số điện thoại đã tồn tại', 409, 'PHONE_EXISTS');
  }

  const randomPasswordHash = await bcrypt.hash(randomBytes(32).toString('hex'), env.BCRYPT_SALT_ROUNDS);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: data.phone || null,
        fullName: data.fullName,
        passwordHash: randomPasswordHash,
        role: 'PARTNER',
        status: 'PENDING_VERIFICATION',
        mustChangePassword: true,
      },
    });
    const member = await tx.partnerMember.create({
      data: { partnerId, userId: user.id, branchId: branch.id, role: 'STAFF', status: 'INVITED' },
      include: { user: true, branch: true, partner: true },
    });
    await auditLog(ownerId, 'PARTNER_CREATE_STAFF', 'PartnerMember', member.id, {
      staffUserId: user.id,
      branchId: branch.id,
    }, tx);
    return member;
  });

  const delivery = { otp: true, welcome: true };
  try {
    await issueOtp({ userId: result.userId, email: result.user.email, fullName: result.user.fullName, purpose: 'STAFF_SETUP' });
  } catch (error) {
    delivery.otp = false;
    logger.warn({ userId: result.userId, code: error.code }, 'Staff setup OTP could not be delivered');
  }
  try {
    await queueEmail({
      userId: result.userId,
      recipient: result.user.email,
      template: 'STAFF_ACCOUNT_CREATED',
      payload: { businessName: result.partner.businessName, branchName: result.branch.name },
    });
  } catch (error) {
    delivery.welcome = false;
    logger.warn({ userId: result.userId, error: error.message }, 'Staff welcome email could not be queued');
  }
  return { ...result, delivery };
}

export async function updateStaff(ownerId, partnerId, memberId, data) {
  const member = await prisma.partnerMember.findFirst({
    where: { id: memberId, partnerId, role: 'STAFF' },
    include: { user: true },
  });
  if (!member) throw new AppError('Không tìm thấy nhân viên', 404, 'PARTNER_MEMBER_NOT_FOUND');
  if (data.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: data.branchId, partnerId, isActive: true } });
    if (!branch) throw new AppError('Chi nhánh không hợp lệ', 400, 'INVALID_BRANCH_SCOPE');
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.partnerMember.update({
      where: { id: memberId },
      data: {
        ...(data.branchId ? { branchId: data.branchId } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
      include: { user: true, branch: true },
    });
    if (data.status) {
      await tx.user.update({
        where: { id: member.userId },
        data: { status: data.status === 'INACTIVE' ? 'LOCKED' : member.user.emailVerifiedAt ? 'ACTIVE' : 'PENDING_VERIFICATION' },
      });
    }
    await auditLog(ownerId, 'PARTNER_UPDATE_STAFF', 'PartnerMember', memberId, data, tx);
    return updated;
  });
}

export async function getStaffRedeemHistory(userId, branchId) {
  return prisma.voucherUsageLog.findMany({
    where: { redeemedBy: userId, branchId },
    include: { voucherCode: { include: { voucher: { select: { title: true } } } }, branch: true },
    orderBy: { redeemedAt: 'desc' },
    take: 100,
  });
}
