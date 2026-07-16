import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/appError.js";

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

  // Ký JWT
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    user: userWithoutPassword
  };
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
