import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/appError.js";
import * as auditLogService from "../auditLogs/auditLog.service.js";
import { AUDIT_ACTIONS } from "../../constants/auditActions.js";

function stripPasswordHash(user) {
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "USER_NOT_FOUND");
  }

  return stripPasswordHash(user);
}

export async function updateProfile(userId, data) {
  const fullName = data.fullName.trim();
  const normalizedPhone = data.phone?.trim() || null;

  if (normalizedPhone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        id: { not: userId }
      }
    });

    if (existingPhone) {
      throw new AppError("Số điện thoại đã tồn tại trong hệ thống", 409, "PHONE_EXISTS");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName,
      phone: normalizedPhone
    }
  });

  await auditLogService.log(
    userId,
    AUDIT_ACTIONS.CUSTOMER_UPDATE_PROFILE,
    "User",
    userId,
    { fullName, phone: normalizedPhone }
  );

  return stripPasswordHash(updatedUser);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404, "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400, "INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(newPassword, Number(env.BCRYPT_SALT_ROUNDS));

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  await auditLogService.log(
    userId,
    AUDIT_ACTIONS.CUSTOMER_CHANGE_PASSWORD,
    "User",
    userId
  );

  return { success: true };
}
