import * as usersService from "./users.service.js";
import { updateProfileSchema, changePasswordSchema } from "./users.validator.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công",
    data: user
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const validatedData = updateProfileSchema.parse(req.body);
  const updatedUser = await usersService.updateProfile(req.user.userId, validatedData);

  return res.status(200).json({
    success: true,
    message: "Cập nhật thông tin thành công",
    data: updatedUser
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const validatedData = changePasswordSchema.parse(req.body);
  await usersService.changePassword(req.user.userId, validatedData);

  return res.status(200).json({
    success: true,
    message: "Đổi mật khẩu thành công",
    data: { success: true }
  });
});
