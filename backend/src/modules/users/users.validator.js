import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên không được để trống"),
  phone: z.string().optional().nullable()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
});
