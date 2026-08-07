import test from 'node:test';
import assert from 'node:assert/strict';
import { getRefundEligibility } from '../src/modules/orders/refundEligibility.js';

test('refund eligibility is derived from backend order state', () => {
  const eligibleOrder = {
    status: 'COMPLETED',
    payment: { status: 'PAID', paidAt: new Date('2026-08-07T00:00:00+07:00') },
    refundRequest: null,
    voucherCodes: [{ status: 'ISSUED' }],
    items: [
      {
        voucher: {
          allowRefund: true,
          refundWindowHours: 24,
        },
      },
    ],
  };

  assert.deepEqual(getRefundEligibility(eligibleOrder, Date.parse('2026-08-07T12:00:00+07:00')), {
    eligible: true,
  });
});

test('refund eligibility rejects unpaid orders', () => {
  const result = getRefundEligibility({
    status: 'COMPLETED',
    payment: { status: 'PENDING' },
    voucherCodes: [{ status: 'ISSUED' }],
    items: [{ voucher: { allowRefund: true, refundWindowHours: 24 } }],
  });

  assert.deepEqual(result, { eligible: false, reason: 'UNPAID' });
});

test('refund eligibility rejects refunded-state mutations from the backend', () => {
  const result = getRefundEligibility({
    status: 'COMPLETED',
    payment: { status: 'PAID', paidAt: new Date('2026-08-07T00:00:00+07:00') },
    refundRequest: { id: 'refund-1' },
    voucherCodes: [{ status: 'ISSUED' }],
    items: [{ voucher: { allowRefund: true, refundWindowHours: 24 } }],
  });

  assert.deepEqual(result, { eligible: false, reason: 'REFUND_ALREADY_REQUESTED' });
});
