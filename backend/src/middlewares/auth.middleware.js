import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Chưa xác thực", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401, "TOKEN_EXPIRED"));
    }

    return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
    }

    if (user.status !== "ACTIVE") {
      return next(new AppError("Tài khoản đã bị khoá", 403, "ACCOUNT_LOCKED"));
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };
    return next();
  } catch (err) {
    return next(err);
  }
};
