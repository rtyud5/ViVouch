export function getRefundEligibility(order, now = Date.now()) {
  if (!order) return { eligible: false, reason: 'ORDER_NOT_FOUND' };

  if (order.payment?.status !== 'PAID') return { eligible: false, reason: 'UNPAID' };
  if (order.status !== 'COMPLETED') return { eligible: false, reason: 'ORDER_NOT_COMPLETED' };
  if (order.refundRequest) return { eligible: false, reason: 'REFUND_ALREADY_REQUESTED' };

  const voucherCodes = Array.isArray(order.voucherCodes) ? order.voucherCodes : [];
  if (voucherCodes.some((code) => code?.status !== 'ISSUED')) {
    return { eligible: false, reason: 'VOUCHER_NOT_REFUNDABLE' };
  }

  const items = Array.isArray(order.items) ? order.items : [];
  if (items.some((item) => item?.voucher?.allowRefund === false)) {
    return { eligible: false, reason: 'REFUND_NOT_ALLOWED' };
  }

  const refundWindowHours = items.length
    ? Math.max(...items.map((item) => Number(item?.voucher?.refundWindowHours || 0)))
    : 0;

  const paidAt = order.payment?.paidAt ? new Date(order.payment.paidAt).getTime() : Number.NaN;
  if (Number.isNaN(paidAt)) return { eligible: false, reason: 'INVALID_ORDER_DATE' };

  const expiry = paidAt + refundWindowHours * 60 * 60 * 1000;
  if (now > expiry) {
    return { eligible: false, reason: 'REFUND_WINDOW_EXPIRED' };
  }

  return { eligible: true };
}
