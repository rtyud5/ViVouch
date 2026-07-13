import { describe, it, expect, vi } from 'vitest';
import { createCheckoutIdempotencyKey } from './idempotencyKey';

describe('createCheckoutIdempotencyKey', () => {
  it('calls randomUUID and returns its value when available', () => {
    const mockUUID = '11111111-2222-3333-4444-555555555555';
    const mockCrypto = {
      randomUUID: vi.fn(() => mockUUID),
      getRandomValues: vi.fn(),
    };

    const key = createCheckoutIdempotencyKey(mockCrypto);

    expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(mockCrypto.getRandomValues).not.toHaveBeenCalled();
    expect(key).toBe(mockUUID);
  });

  it('uses getRandomValues fallback when randomUUID is absent', () => {
    // Provide a deterministic getRandomValues implementation
    const fixedBytes = new Uint8Array(16).fill(0xab);
    const mockCrypto = {
      randomUUID: undefined,
      getRandomValues: vi.fn((arr) => {
        arr.set(fixedBytes);
        return arr;
      }),
    };

    const key = createCheckoutIdempotencyKey(mockCrypto);

    expect(mockCrypto.getRandomValues).toHaveBeenCalledTimes(1);
    // 16 bytes of 0xab → "ab" repeated 16 times
    const expectedHex = 'ab'.repeat(16);
    expect(key).toBe(`checkout-${expectedHex}`);
  });

  it('produces a key between 8 and 128 characters using the getRandomValues path', () => {
    const mockCrypto = {
      randomUUID: undefined,
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      },
    };

    const key = createCheckoutIdempotencyKey(mockCrypto);

    expect(key.length).toBeGreaterThanOrEqual(8);
    expect(key.length).toBeLessThanOrEqual(128);
  });

  it('throws a descriptive error when neither randomUUID nor getRandomValues is available', () => {
    const emptyCrypto = {};

    expect(() => createCheckoutIdempotencyKey(emptyCrypto)).toThrow(
      'Trình duyệt không hỗ trợ tạo mã thanh toán an toàn',
    );
  });

  it('throws when cryptoApi is null', () => {
    expect(() => createCheckoutIdempotencyKey(null)).toThrow();
  });

  it('throws an error when global crypto is missing and fallback is triggered', () => {
    // If we pass undefined, default parameter becomes globalThis.crypto.
    // Let's create an environment object without it:
    const emptyApi = {};
    expect(() => createCheckoutIdempotencyKey(emptyApi)).toThrow();
  });

  it('does not reference Math.random in the module source', async () => {
    // Dynamic import to get the raw module URL and inspect source
    const mod = await import('./idempotencyKey?raw');
    expect(mod.default).not.toContain('Math.random');
  });
});
