import { ROLES } from "../constants/roles.js";

const VALID_ROLES = Object.values(ROLES);

/**
 * Middleware kiểm tra quyền truy cập theo vai trò (Role-Based Access Control)
 * @param {...string} roles Danh sách các vai trò được phép truy cập
 */
export const requireRole = (...roles) => {
  // Chuẩn hóa danh sách roles truyền vào thành chữ in hoa
  const normalizedRoles = roles.map(r => r.toUpperCase());

  // Kiểm tra xem các role truyền vào middleware có hợp lệ trong hệ thống hay không
  const invalidRoles = normalizedRoles.filter(r => !VALID_ROLES.includes(r));
  if (invalidRoles.length > 0) {
    throw new Error(`Cấu hình Role không hợp lệ: ${invalidRoles.join(", ")}`);
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      const error = new Error("Chưa xác thực");
      error.statusCode = 401;
      return next(error);
    }

    const userRole = req.user.role.toUpperCase();

    if (!normalizedRoles.includes(userRole)) {
      const error = new Error("Không có quyền truy cập");
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};
