// frontend/src/utils/refundEligibility.js
export function getRefundEligibility(order, now = Date.now()) {
  if (!order) return { eligible: false, reason: 'ORDER_NOT_FOUND' };

  // Basic checks
  if (order.payment?.status !== 'PAID') return { eligible: false, reason: 'UNPAID' };
  if (order.status !== 'COMPLETED') return { eligible: false, reason: 'ORDER_NOT_COMPLETED' };
  if (order.refundRequest) return { eligible: false, reason: 'REFUND_ALREADY_REQUESTED' };

  const voucherCodes = Array.isArray(order.voucherCodes) ? order.voucherCodes : [];
  // If any code is not ISSUED, voucher not refund-able
  if (voucherCodes.some(code => code?.status !== 'ISSUED')) {
    return { eligible: false, reason: 'VOUCHER_NOT_REFUNDABLE' };
  }

  const items = Array.isArray(order.items) ? order.items : [];
  // If any item disallows refunds, refund not allowed
  if (items.some(item => item?.voucher?.allowRefund === false)) {
    return { eligible: false, reason: 'REFUND_NOT_ALLOWED' };
  }

  // Determine refund window (use max refundWindowHours across items if multiple)
  const refundWindowHours = items.length
    ? Math.max(...items.map(i => Number(i?.voucher?.refundWindowHours || 0)))
    : 0;

  const created = Date.parse(order.createdAt);
  if (Number.isNaN(created)) return { eligible: false, reason: 'INVALID_ORDER_DATE' };

  const expiry = created + refundWindowHours * 60 * 60 * 1000;
  if (now > expiry) {
    return { eligible: false, reason: 'REFUND_WINDOW_EXPIRED' };
  }

  return { eligible: true };
}
