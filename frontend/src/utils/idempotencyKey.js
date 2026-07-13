/**
 * Creates a cryptographically secure checkout idempotency key.
 *
 * Priority:
 *   1. crypto.randomUUID()  — preferred, returns RFC-4122 UUID.
 *   2. crypto.getRandomValues() — fallback, 16 random bytes -> 32-char hex string prefixed
 *      with "checkout-", producing a valid key of length > 8.
 *   3. Throws — rather than falling back to insecure generators.
 *
 * @param {Crypto} [cryptoApi=globalThis.crypto]
 * @returns {string}
 */
export function createCheckoutIdempotencyKey(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues !== 'function') {
    throw new Error('Trình duyệt không hỗ trợ tạo mã thanh toán an toàn');
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);

  const token = Array.from(bytes, (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');

  return `checkout-${token}`;
}
