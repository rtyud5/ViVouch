import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Middleware xác thực token JWT
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Chưa xác thực");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("Token expired");
      error.statusCode = 401;
      return next(error);
    }
    const error = new Error("Invalid token");
    error.statusCode = 401;
    return next(error);
  }
};
