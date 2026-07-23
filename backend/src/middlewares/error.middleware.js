import { logger } from "../config/logger.js";
import { getRequestContext } from "./requestContext.middleware.js";

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
  const { requestId } = getRequestContext();
  const statusCode = err.statusCode || 500;
  const log = statusCode >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);

  log(
    {
      err,
      method: req.method,
      path: req.originalUrl,
      requestId,
    },
    "Request failed"
  );

  const prismaError = prismaErrorMap[err.code];
  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      success: false,
      message: prismaError.message(err),
      code: prismaError.code,
      requestId,
    });
  }

  if (err.name === "ZodError") {
    let msg = "Validation Error";
    let details = err.errors;
    try {
      let firstError;
      if (err.errors && err.errors.length > 0) {
        firstError = err.errors[0];
        details = err.errors;
      } else if (err.message && err.message.startsWith("[")) {
        details = JSON.parse(err.message);
        firstError = details[0];
      } else if (err.issues && err.issues.length > 0) {
        firstError = err.issues[0];
        details = err.issues;
      } else {
        details = [{ message: err.message }];
      }

      if (firstError) {
        msg = firstError.path && firstError.path.length > 0
          ? `${firstError.path.join('.')}: ${firstError.message}`
          : firstError.message;
      } else {
        msg = err.message;
      }
    } catch (e) {
      details = details || [];
    }

    return res.status(400).json({
      success: false,
      message: msg,
      code: "VALIDATION_ERROR",
      details: details || [],
      requestId,
    });
  }
  
  const isServerError = statusCode >= 500;
  const payload = {
    success: false,
    message: isServerError ? (err.message || "Internal Server Error") : (err.message || "Request failed"),
    code: err.code || (isServerError ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
    requestId,
  };

  if (!isServerError && err.details) {
    payload.details = err.details;
  }

  return res.status(statusCode).json(payload);
}
