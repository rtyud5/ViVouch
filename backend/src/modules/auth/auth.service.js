import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

/**
 * Đăng ký tài khoản mới (Customer)
 * @param {Object} data { email, password, fullName, phone }
 * @returns {Object} user (không chứa passwordHash)
 */
export const register = async (data) => {
  const { email, password, fullName, phone } = data;

  // Kiểm tra email trùng
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error("Email đã tồn tại trong hệ thống");
    error.statusCode = 409;
    throw error;
  }

  // Hash mật khẩu
  const passwordHash = await bcrypt.hash(password, Number(env.BCRYPT_SALT_ROUNDS));

  // Tạo user với role mặc định là CUSTOMER
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
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
 * @returns {Object} { accessToken, refreshToken, user }
 */
export const login = async (email, password) => {
  // Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error("Sai email hoặc mật khẩu");
    error.statusCode = 401;
    throw error;
  }

  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error("Sai email hoặc mật khẩu");
    error.statusCode = 401;
    throw error;
  }

  // Kiểm tra trạng thái ACTIVE
  if (user.status !== "ACTIVE") {
    const error = new Error("Tài khoản của bạn đã bị khóa");
    error.statusCode = 403;
    throw error;
  }

  // Ký JWT
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
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
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
