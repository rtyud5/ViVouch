import test from 'node:test';
import assert from 'node:assert/strict';
import { generateNumericOtp, hashOtpValue, verifyOtpValue } from '../src/modules/otp/otp.crypto.js';

test('OTP generator always returns six numeric digits', () => {
  for (let index = 0; index < 100; index += 1) assert.match(generateNumericOtp(), /^\d{6}$/);
});

test('OTP hash is deterministic with pepper and timing-safe verifier rejects changes', () => {
  const hash = hashOtpValue('123456', 'unit-test-pepper');
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(verifyOtpValue('123456', hash, 'unit-test-pepper'), true);
  assert.equal(verifyOtpValue('123457', hash, 'unit-test-pepper'), false);
  assert.equal(verifyOtpValue('123456', hash, 'other-pepper'), false);
  assert.equal(verifyOtpValue('123456', 'invalid', 'unit-test-pepper'), false);
});
