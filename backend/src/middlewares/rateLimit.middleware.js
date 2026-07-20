import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

export function createRateLimiter({ windowMs, max, message, skipInTest = true }) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => skipInTest && env.NODE_ENV === 'test',
    handler(req, res) {
      res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message,
      });
    },
  });
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Bạn đã thử đăng nhập hoặc đăng ký quá nhiều lần. Vui lòng thử lại sau.',
});

export const checkoutRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Bạn đã gửi quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau.',
});

export const redeemCheckRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Bạn đã kiểm tra quá nhiều mã voucher. Vui lòng thử lại sau.',
});

export const redeemConfirmRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Bạn đã xác nhận quá nhiều mã voucher. Vui lòng thử lại sau.',
});
