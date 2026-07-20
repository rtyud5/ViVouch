import { AppError } from '../utils/appError.js';

const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

/**
 * Validates an optional Idempotency-Key and exposes its normalized value on
 * req.idempotencyKey. Persistence and replay are handled atomically by the
 * checkout service through Order.idempotencyKey.
 */
export function captureIdempotencyKey(req, _res, next) {
  const raw = req.get('Idempotency-Key');
  if (!raw) return next();

  const key = raw.trim();
  if (!KEY_PATTERN.test(key)) {
    return next(new AppError(
      'Idempotency-Key phải dài 8-128 ký tự và chỉ chứa chữ, số, dấu chấm, gạch, gạch dưới hoặc dấu hai chấm',
      400,
      'INVALID_IDEMPOTENCY_KEY',
    ));
  }

  req.idempotencyKey = key;
  return next();
}
