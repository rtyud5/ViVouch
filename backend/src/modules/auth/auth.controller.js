import * as authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validator.js";

/**
 * Đăng ký tài khoản
 */
export const register = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const parsedData = registerSchema.parse(req.body);

    // Gọi service
    const user = await authService.register(parsedData);

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: user
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors
      });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Lỗi server nội bộ"
    });
  }
};

/**
 * Đăng nhập
 */
export const login = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const parsedData = loginSchema.parse(req.body);

    // Gọi service
    const result = await authService.login(parsedData.email, parsedData.password);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: result
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors
      });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Lỗi server nội bộ"
    });
  }
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
export const getMe = async (req, res) => {
  try {
    // Giả sử middleware xác thực đã gán userId vào req.user.userId
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực"
      });
    }

    const user = await authService.getMe(userId);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công",
      data: user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Lỗi server nội bộ"
    });
  }
};

/**
 * Đăng xuất
 */
export const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Đăng xuất thành công"
  });
};
