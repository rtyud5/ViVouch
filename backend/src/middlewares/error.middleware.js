import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const prismaErrorMap = {
  P2002: {
    statusCode: 409,
    code: "DUPLICATE_RESOURCE",
    message: (err) => {
      const fields = err.meta?.target?.join(", ") || "du lieu";
      return `${fields} da ton tai, vui long chon gia tri khac`;
    },
  },
  P2025: {
    statusCode: 404,
    code: "NOT_FOUND",
    message: () => "Khong tim thay du lieu can thao tac",
  },
  P2003: {
    statusCode: 409,
    code: "RESOURCE_IN_USE",
    message: () => "Khong the xoa du lieu vi dang duoc tham chieu boi du lieu khac",
  },
};

export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const log = statusCode >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);

  log(
    {
      err,
      method: req.method,
      path: req.originalUrl,
    },
    "Request failed"
  );

  const prismaError = prismaErrorMap[err.code];
  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message(err),
      code: prismaError.code,
    });
  }

  if (err.name === "ZodError") {
    let msg = "Validation Error";
    try {
      if (err.errors && err.errors.length > 0) {
        msg = err.errors[0].message;
      } else if (err.message && err.message.startsWith("[")) {
        msg = JSON.parse(err.message)[0].message;
      } else if (err.issues && err.issues.length > 0) {
        msg = err.issues[0].message;
      }
    } catch (e) {
      // fallback
    }
    
    return res.status(400).json({
      success: false,
      message: msg,
      code: "VALIDATION_ERROR",
      details: err.errors || JSON.parse(err.message || "[]"),
    });
  }

  const isServerError = statusCode >= 500;
  const payload = {
    success: false,
    message: isServerError ? "Internal Server Error" : (err.message || "Request failed"),
    code: err.code || (isServerError ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
  };

  if (!isServerError && err.details) {
    payload.details = err.details;
  }

  if (!isServerError && env.NODE_ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}
