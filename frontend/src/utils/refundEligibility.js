export function getRefundEligibility(order, now = Date.now()) {
  if (!order || order.status !== 'COMPLETED' || order.payment?.status !== 'PAID') {
    return { eligible: false, reason: 'ORDER_NOT_PAID' };
  }
  if (order.refundRequest) return { eligible: false, reason: 'REFUND_ALREADY_EXISTS' };
  if (!order.voucherCodes?.length || order.voucherCodes.some((code) => code.status !== 'ISSUED')) {
    return { eligible: false, reason: 'VOUCHER_NOT_REFUNDABLE' };
  }
  if (!order.items?.length) return { eligible: false, reason: 'EMPTY_ORDER' };

  for (const item of order.items) {
    if (!item.voucher?.allowRefund) return { eligible: false, reason: 'REFUND_NOT_ALLOWED' };
    const hours = Number(item.voucher.refundWindowHours || 0);
    const createdAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAt) || hours <= 0 || now > createdAt + hours * 60 * 60 * 1000) {
      return { eligible: false, reason: 'REFUND_WINDOW_EXPIRED' };
    }
  }
  return { eligible: true, reason: null };
}
