import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/appError.js";
import { nanoid } from "nanoid";

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  );
}

async function issueRefreshToken(user, db = prisma) {
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh", nonce: nanoid(24) },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  );
  const decoded = jwt.decode(refreshToken);

  await db.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return refreshToken;
}

/**
 * Đăng ký tài khoản mới (Customer)
 * @param {Object} data { email, password, fullName, phone }
 * @returns {Object} user (không chứa passwordHash)
 */
export const register = async (data) => {
  const { email, password, fullName, phone } = data;
  const normalizedPhone = phone?.trim() || null;

  // Kiểm tra email trùng
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError("Email đã tồn tại trong hệ thống", 409, "EMAIL_EXISTS");
  }

  // Kiểm tra phone trùng (nếu có cung cấp số điện thoại)
  if (normalizedPhone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (existingPhone) {
      throw new AppError("Số điện thoại đã tồn tại trong hệ thống", 409, "PHONE_EXISTS");
    }
  }

  // Hash mật khẩu
  const passwordHash = await bcrypt.hash(password, Number(env.BCRYPT_SALT_ROUNDS));

  // Tạo user với role mặc định là CUSTOMER
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone: normalizedPhone,
      role: "CUSTOMER"
    }
  });

  // Loại bỏ passwordHash trước khi trả về
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {Object} { accessToken, user }
 */
export const login = async (email, password) => {
  // Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("Sai email hoặc mật khẩu", 401, "INVALID_CREDENTIALS");
  }

  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Sai email hoặc mật khẩu", 401, "INVALID_CREDENTIALS");
  }

  // Kiểm tra trạng thái ACTIVE
  if (user.status !== "ACTIVE") {
    throw new AppError("Tài khoản của bạn đã bị khóa", 403, "ACCOUNT_LOCKED");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword
  };
};

export const refreshSession = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Refresh token không hợp lệ hoặc đã hết hạn", 401, "INVALID_REFRESH_TOKEN");
  }

  if (!payload || typeof payload !== "object" || payload.type !== "refresh" || !payload.userId) {
    throw new AppError("Refresh token không hợp lệ", 401, "INVALID_REFRESH_TOKEN");
  }

  return prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt <= new Date()) {
      throw new AppError("Refresh token không hợp lệ hoặc đã bị thu hồi", 401, "INVALID_REFRESH_TOKEN");
    }

    if (stored.user.status !== "ACTIVE") {
      throw new AppError("Tài khoản của bạn đã bị khóa", 403, "ACCOUNT_LOCKED");
    }

    const revoked = await tx.refreshToken.updateMany({
      where: { id: stored.id, isRevoked: false },
      data: { isRevoked: true },
    });
    if (revoked.count !== 1) {
      throw new AppError("Refresh token đã được sử dụng", 401, "INVALID_REFRESH_TOKEN");
    }

    const nextRefreshToken = await issueRefreshToken(stored.user, tx);
    const accessToken = signAccessToken(stored.user);
    const { passwordHash: _, ...user } = stored.user;

    return { accessToken, refreshToken: nextRefreshToken, user };
  });
};

export const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
};

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { delivery: "SIMULATED", resetToken: null };

  const resetToken = jwt.sign(
    { userId: user.id, type: "password-reset", nonce: nanoid(24) },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "15m" },
  );
  const decoded = jwt.decode(resetToken);
  await prisma.refreshToken.create({
    data: { token: resetToken, userId: user.id, expiresAt: new Date(decoded.exp * 1000) },
  });

  return {
    delivery: "SIMULATED",
    resetToken: env.NODE_ENV === "production" ? null : resetToken,
  };
};

export const resetPassword = async (resetToken, password) => {
  let payload;
  try {
    payload = jwt.verify(resetToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 401, "INVALID_RESET_TOKEN");
  }
  if (!payload || typeof payload !== "object" || payload.type !== "password-reset" || !payload.userId) {
    throw new AppError("Mã đặt lại mật khẩu không hợp lệ", 401, "INVALID_RESET_TOKEN");
  }

  const passwordHash = await bcrypt.hash(password, Number(env.BCRYPT_SALT_ROUNDS));
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.refreshToken.updateMany({
      where: { token: resetToken, userId: payload.userId, isRevoked: false, expiresAt: { gt: new Date() } },
      data: { isRevoked: true },
    });
    if (consumed.count !== 1) throw new AppError("Mã đặt lại mật khẩu đã được sử dụng", 401, "INVALID_RESET_TOKEN");
    await tx.user.update({ where: { id: payload.userId }, data: { passwordHash } });
    await tx.refreshToken.updateMany({ where: { userId: payload.userId, isRevoked: false }, data: { isRevoked: true } });
  });
};

/**
 * Lấy thông tin user hiện tại
 * @param {string} userId
 * @returns {Object} user info (không chứa passwordHash)
 */
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "USER_NOT_FOUND");
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
