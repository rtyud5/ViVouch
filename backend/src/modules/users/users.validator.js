import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên không được để trống").optional(),
  phone: z.string().trim().regex(/^[0-9]{8,15}$/, "Số điện thoại không hợp lệ").optional().nullable()
}).refine(data => Object.keys(data).length > 0, { message: 'Không có dữ liệu cần cập nhật' });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
});
