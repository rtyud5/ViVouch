import { ROLES } from "../constants/roles.js";
import { AppError } from "../utils/appError.js";

const VALID_ROLES = Object.values(ROLES);

export const requireRole = (...roles) => {
  const normalizedRoles = roles.map((role) => role.toUpperCase());

  const invalidRoles = normalizedRoles.filter((role) => !VALID_ROLES.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`Cau hinh Role khong hop le: ${invalidRoles.join(", ")}`);
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("Chưa xác thực", 401, "UNAUTHORIZED"));
    }

    const userRole = req.user.role.toUpperCase();

    if (!normalizedRoles.includes(userRole)) {
      return next(new AppError("Không có quyền truy cập", 403, "FORBIDDEN"));
    }

    return next();
  };
};
