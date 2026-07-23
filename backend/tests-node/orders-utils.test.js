import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateAndSortItems,
  createCheckoutFingerprint,
  createNumericProviderOrderCode,
} from '../src/modules/orders/orders.utils.js';

test('aggregateAndSortItems merges duplicate vouchers deterministically', () => {
  assert.deepEqual(
    aggregateAndSortItems([{ id: 'b', qty: 1 }, { id: 'a', qty: 2 }, { id: 'b', qty: 3 }]),
    [{ id: 'a', qty: 2 }, { id: 'b', qty: 4 }],
  );
});

test('checkout fingerprint is stable for canonical items and changes with payload', () => {
  const items = [{ id: 'a', qty: 2 }];
  const data = { paymentMethod: 'PAYOS', recipientName: 'An', recipientPhone: null, note: null };
  assert.equal(createCheckoutFingerprint(items, data), createCheckoutFingerprint(items, { ...data }));
  assert.notEqual(createCheckoutFingerprint(items, data), createCheckoutFingerprint(items, { ...data, note: 'new' }));
});

test('provider order code is a safe positive integer string', () => {
  const code = createNumericProviderOrderCode();
  assert.match(code, /^\d{15,16}$/);
  assert.ok(Number.isSafeInteger(Number(code)));
});
