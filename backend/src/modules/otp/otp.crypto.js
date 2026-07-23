import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export function generateNumericOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtpValue(otp, pepper) {
  if (!pepper) throw new Error('OTP pepper is required');
  return createHmac('sha256', pepper).update(String(otp)).digest('hex');
}

export function verifyOtpValue(otp, expectedHash, pepper) {
  if (!expectedHash || !pepper) return false;
  const actual = Buffer.from(hashOtpValue(otp, pepper), 'hex');
  const expected = Buffer.from(String(expectedHash), 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
