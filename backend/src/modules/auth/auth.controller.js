import * as authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Đăng ký tài khoản
 */
export const register = asyncHandler(async (req, res) => {
  // Validate dữ liệu đầu vào
  const parsedData = registerSchema.parse(req.body);

  // Gọi service
  const user = await authService.register(parsedData);

  return res.status(201).json({
    success: true,
    message: "Đăng ký tài khoản thành công",
    data: user
  });
});

/**
 * Đăng nhập
 */
export const login = asyncHandler(async (req, res) => {
  // Validate dữ liệu đầu vào
  const parsedData = loginSchema.parse(req.body);

  // Gọi service
  const result = await authService.login(parsedData.email, parsedData.password);

  return res.status(200).json({
    success: true,
    message: "Đăng nhập thành công",
    data: result
  });
});

/**
 * Lấy thông tin tài khoản hiện tại
 */
export const getMe = asyncHandler(async (req, res) => {
  // Giả sử middleware xác thực đã gán userId vào req.user.userId
  const userId = req.user?.userId;

  if (!userId) {
    const error = new Error("Chưa xác thực");
    error.statusCode = 401;
    throw error;
  }

  const user = await authService.getMe(userId);

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công",
    data: user
  });
});

/**
 * Đăng xuất
 */
export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Đăng xuất thành công"
  });
};
