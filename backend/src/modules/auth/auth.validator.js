import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, "Thiếu refresh token")
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(1).optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ")
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().trim().min(1, "Thiếu mã đặt lại mật khẩu"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu cần ít nhất một chữ hoa")
    .regex(/[a-z]/, "Mật khẩu cần ít nhất một chữ thường")
    .regex(/[0-9]/, "Mật khẩu cần ít nhất một chữ số")
});
