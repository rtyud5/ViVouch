import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleLandingPath, isApprovedPartnerOwner } from '../src/utils/roleLanding.js';
import { getRefundEligibility } from '../src/utils/refundEligibility.js';

test('role landing separates customer, pending owner, approved owner and staff', () => {
  assert.equal(getRoleLandingPath({ role: 'CUSTOMER' }), '/customer/home');
  assert.equal(getRoleLandingPath({ role: 'ADMIN' }), '/admin/dashboard');
  assert.equal(getRoleLandingPath({ role: 'PARTNER', partnerMemberships: [] }), '/partner/profile');
  const owner = { role: 'PARTNER', partnerMemberships: [{ role: 'OWNER', status: 'ACTIVE', partner: { status: 'APPROVED' } }] };
  const staff = { role: 'PARTNER', partnerMemberships: [{ role: 'STAFF', status: 'ACTIVE', partner: { status: 'APPROVED' } }] };
  assert.equal(getRoleLandingPath(owner), '/partner/dashboard');
  assert.equal(getRoleLandingPath(staff), '/partner/validation');
  assert.equal(isApprovedPartnerOwner(owner), true);
  assert.equal(isApprovedPartnerOwner(staff), false);
});

test('refund eligibility requires paid order, issued codes, policy and active window', () => {
  const order = {
    status: 'COMPLETED',
    createdAt: '2026-07-22T00:00:00.000Z',
    payment: { status: 'PAID' },
    refundRequest: null,
    voucherCodes: [{ status: 'ISSUED' }],
    items: [{ voucher: { allowRefund: true, refundWindowHours: 24 } }],
  };
  assert.equal(getRefundEligibility(order, Date.parse('2026-07-22T12:00:00.000Z')).eligible, true);
  assert.equal(getRefundEligibility(order, Date.parse('2026-07-24T00:00:00.000Z')).reason, 'REFUND_WINDOW_EXPIRED');
  assert.equal(getRefundEligibility({ ...order, voucherCodes: [{ status: 'USED' }] }).reason, 'VOUCHER_NOT_REFUNDABLE');
  assert.equal(getRefundEligibility({ ...order, items: [{ voucher: { allowRefund: false, refundWindowHours: 24 } }] }).reason, 'REFUND_NOT_ALLOWED');
});
