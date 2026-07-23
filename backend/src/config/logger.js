import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "passwordHash",
      "otp",
      "codeHash",
      "SMTP_PASSWORD",
      "PAYOS_API_KEY",
      "PAYOS_CHECKSUM_KEY",
      "*.password",
      "*.passwordHash",
      "*.otp",
      "*.token",
      "*.refreshToken",
      "email",
      "recipient",
      "*.email",
      "*.recipient",
    ],
    censor: "[REDACTED]",
  },
});
