import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../utils/appError.js';
import { issueOtp, consumeOtp } from '../otp/otp.service.js';

function signAccessToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
}

async function issueRefreshToken(user, db = prisma) {
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh', nonce: nanoid(24) },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  );
  const decoded = jwt.decode(refreshToken);
  await db.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(decoded.exp * 1000) },
  });
  return refreshToken;
}

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function ensureUniqueIdentity(email, phone, tx = prisma) {
  const [existingUser, existingPhone] = await Promise.all([
    tx.user.findUnique({ where: { email } }),
    phone ? tx.user.findFirst({ where: { phone } }) : null,
  ]);
  if (existingUser) {
    // Cho phép đăng ký lại nếu tài khoản cũ chưa xác minh email
    if (existingUser.status === 'PENDING_VERIFICATION' && !existingUser.emailVerifiedAt) {
      await tx.emailOtp.deleteMany({ where: { userId: existingUser.id } });
      await tx.refreshToken.deleteMany({ where: { userId: existingUser.id } });
      await tx.wallet.deleteMany({ where: { userId: existingUser.id } });
      await tx.partnerMember.deleteMany({ where: { userId: existingUser.id } });
      await tx.notification.deleteMany({ where: { userId: existingUser.id } });
      await tx.auditLog.deleteMany({ where: { actorId: existingUser.id } });
      await tx.emailDelivery.deleteMany({ where: { userId: existingUser.id } });
      await tx.user.delete({ where: { id: existingUser.id } });
      logger.info({ email }, 'Cleaned up unverified account for re-registration');
    } else {
      throw new AppError('Email đã tồn tại trong hệ thống', 409, 'EMAIL_EXISTS');
    }
  }
  if (existingPhone && existingPhone.email !== email) {
    throw new AppError('Số điện thoại đã tồn tại trong hệ thống', 409, 'PHONE_EXISTS');
  }
}

export async function register(data) {
  const normalizedPhone = data.phone?.trim() || null;
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  const status = env.EMAIL_VERIFICATION_REQUIRED ? 'PENDING_VERIFICATION' : 'ACTIVE';
  const newUser = await prisma.$transaction(async (tx) => {
    await ensureUniqueIdentity(data.email, normalizedPhone, tx);
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: normalizedPhone,
        role: 'CUSTOMER',
        status,
        emailVerifiedAt: status === 'ACTIVE' ? new Date() : null,
      },
    });
    await tx.wallet.create({ data: { userId: user.id, balance: env.DEMO_WALLET_INITIAL_BALANCE } });
    return user;
  });

  let emailDelivered = true;
  if (env.EMAIL_VERIFICATION_REQUIRED) {
    try {
      await issueOtp({ userId: newUser.id, email: newUser.email, fullName: newUser.fullName, purpose: 'REGISTER' });
    } catch (error) {
      emailDelivered = false;
      logger.warn({ userId: newUser.id, code: error.code }, 'Registration OTP could not be delivered');
    }
  }
  return { user: publicUser(newUser), verificationRequired: env.EMAIL_VERIFICATION_REQUIRED, emailDelivered };
}

export async function registerPartner(data) {
  const normalizedPhone = data.phone?.trim() || null;
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  const status = env.EMAIL_VERIFICATION_REQUIRED ? 'PENDING_VERIFICATION' : 'ACTIVE';

  const result = await prisma.$transaction(async (tx) => {
    await ensureUniqueIdentity(data.email, normalizedPhone, tx);
    const duplicateTax = await tx.partner.findUnique({ where: { taxCode: data.taxCode } });
    if (duplicateTax) throw new AppError('Mã số thuế đã được đăng ký', 409, 'TAX_CODE_EXISTS');
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: normalizedPhone,
        passwordHash,
        fullName: data.fullName,
        role: 'PARTNER',
        status,
        emailVerifiedAt: status === 'ACTIVE' ? new Date() : null,
      },
    });
    const partner = await tx.partner.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        taxCode: data.taxCode,
        representativeName: data.representativeName,
        contactEmail: data.contactEmail || data.email,
        contactPhone: data.contactPhone || normalizedPhone,
        address: data.address,
        status: 'PENDING',
      },
    });
    let branch = null;
    if (data.firstBranch) {
      branch = await tx.branch.create({ data: { ...data.firstBranch, partnerId: partner.id } });
    }
    await tx.partnerMember.create({
      data: {
        partnerId: partner.id,
        userId: user.id,
        role: 'OWNER',
        status: status === 'ACTIVE' ? 'ACTIVE' : 'INVITED',
      },
    });
    return { user, partner, branch };
  });

  let emailDelivered = true;
  if (env.EMAIL_VERIFICATION_REQUIRED) {
    try {
      await issueOtp({ userId: result.user.id, email: result.user.email, fullName: result.user.fullName, purpose: 'REGISTER' });
    } catch (error) {
      emailDelivered = false;
      logger.warn({ userId: result.user.id, partnerId: result.partner.id, code: error.code }, 'Partner registration OTP could not be delivered');
    }
  }
  return { user: publicUser(result.user), partner: result.partner, branch: result.branch, verificationRequired: env.EMAIL_VERIFICATION_REQUIRED, emailDelivered };
}

export async function verifyEmail(email, otp) {
  const user = await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { email } });
    if (!current) throw new AppError('Mã OTP không hợp lệ', 400, 'OTP_INVALID');
    const record = await consumeOtp({ email, purpose: 'REGISTER', otp }, tx);
    if (record.userId && record.userId !== current.id) {
      throw new AppError('OTP không thuộc tài khoản này', 400, 'OTP_INVALID');
    }
    const updated = await tx.user.update({
      where: { id: current.id },
      data: { status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    await tx.partnerMember.updateMany({
      where: { userId: updated.id, status: 'INVITED', role: 'OWNER' },
      data: { status: 'ACTIVE' },
    });
    return updated;
  });
  return publicUser(user);
}

export async function resendVerification(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { accepted: true };
  if (user.emailVerifiedAt && user.status === 'ACTIVE') throw new AppError('Email đã được xác minh', 409, 'EMAIL_ALREADY_VERIFIED');
  await issueOtp({ userId: user.id, email: user.email, fullName: user.fullName, purpose: 'REGISTER' });
  return { accepted: true };
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallet: { select: { balance: true } },
      partnerMemberships: {
        where: { status: 'ACTIVE' },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        include: { partner: { select: { id: true, status: true, businessName: true } }, branch: true },
      },
    },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Sai email hoặc mật khẩu', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status === 'PENDING_VERIFICATION' && env.EMAIL_VERIFICATION_REQUIRED) {
    throw new AppError('Vui lòng xác minh email trước khi đăng nhập', 403, 'EMAIL_NOT_VERIFIED');
  }
  if (user.status === 'LOCKED') throw new AppError('Tài khoản của bạn đã bị khóa', 403, 'ACCOUNT_LOCKED');

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return { accessToken, refreshToken, user: publicUser(user) };
}

export async function refreshSession(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401, 'INVALID_REFRESH_TOKEN');
  }
  if (!payload || typeof payload !== 'object' || payload.type !== 'refresh' || !payload.userId) {
    throw new AppError('Refresh token không hợp lệ', 401, 'INVALID_REFRESH_TOKEN');
  }

  return prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            wallet: { select: { balance: true } },
            partnerMemberships: {
              where: { status: 'ACTIVE' },
              orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
              include: { partner: { select: { id: true, status: true, businessName: true } }, branch: true },
            },
          },
        },
      },
    });
    if (!stored || stored.isRevoked || stored.expiresAt <= new Date()) {
      throw new AppError('Refresh token không hợp lệ hoặc đã bị thu hồi', 401, 'INVALID_REFRESH_TOKEN');
    }
    if (stored.user.status === 'LOCKED') {
      throw new AppError('Tài khoản không hoạt động', 403, 'ACCOUNT_LOCKED');
    }
    if (stored.user.status === 'PENDING_VERIFICATION' && env.EMAIL_VERIFICATION_REQUIRED) {
      throw new AppError('Vui lòng xác minh email trước khi tiếp tục', 403, 'EMAIL_NOT_VERIFIED');
    }
    const revoked = await tx.refreshToken.updateMany({ where: { id: stored.id, isRevoked: false }, data: { isRevoked: true } });
    if (revoked.count !== 1) throw new AppError('Refresh token đã được sử dụng', 401, 'INVALID_REFRESH_TOKEN');
    const nextRefreshToken = await issueRefreshToken(stored.user, tx);
    return { accessToken: signAccessToken(stored.user), refreshToken: nextRefreshToken, user: publicUser(stored.user) };
  });
}

export async function logout(userId, refreshToken) {
  await prisma.refreshToken.updateMany({
    where: { userId, ...(refreshToken ? { token: refreshToken } : {}), isRevoked: false },
    data: { isRevoked: true },
  });
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === 'LOCKED') return { accepted: true };
  try {
    await issueOtp({ userId: user.id, email: user.email, fullName: user.fullName, purpose: 'RESET_PASSWORD' });
  } catch (error) {
    logger.warn({ email: email.replace(/^(.{2}).*(@.*)$/, '$1***$2'), error: error.message }, 'Password reset email could not be delivered');
  }
  return { accepted: true };
}

export async function resetPassword(email, otp, password) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Mã OTP không hợp lệ', 400, 'OTP_INVALID');
    const record = await consumeOtp({ email, purpose: 'RESET_PASSWORD', otp }, tx);
    if (record.userId && record.userId !== user.id) throw new AppError('Mã OTP không hợp lệ', 400, 'OTP_INVALID');
    await tx.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } });
    await tx.refreshToken.updateMany({ where: { userId: user.id, isRevoked: false }, data: { isRevoked: true } });
  });
}


export async function resendStaffSetup(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { partnerMemberships: { where: { role: 'STAFF', status: 'INVITED' }, take: 1 } },
  });
  if (!user || user.partnerMemberships.length === 0 || user.emailVerifiedAt) return { accepted: true };
  await issueOtp({ userId: user.id, email: user.email, fullName: user.fullName, purpose: 'STAFF_SETUP' });
  return { accepted: true };
}

export async function completeStaffSetup(email, otp, password) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  return prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { email } });
    if (!current) throw new AppError('Mã OTP không hợp lệ', 400, 'OTP_INVALID');
    const record = await consumeOtp({ email, purpose: 'STAFF_SETUP', otp }, tx);
    if (record.userId && record.userId !== current.id) throw new AppError('Mã OTP không hợp lệ', 400, 'OTP_INVALID');
    const user = await tx.user.update({
      where: { id: current.id },
      data: { passwordHash, status: 'ACTIVE', emailVerifiedAt: new Date(), mustChangePassword: false },
    });
    await tx.partnerMember.updateMany({ where: { userId: user.id, role: 'STAFF' }, data: { status: 'ACTIVE' } });
    return publicUser(user);
  });
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: { select: { balance: true } },
      partnerMemberships: {
        where: { status: { in: ['ACTIVE', 'INVITED'] } },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        include: {
          partner: { select: { id: true, status: true, businessName: true, rejectReason: true } },
          branch: { select: { id: true, name: true, address: true, city: true, isActive: true } },
        },
      },
    },
  });
  if (!user) throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  return publicUser(user);
}
