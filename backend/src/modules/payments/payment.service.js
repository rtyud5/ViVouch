/**
 * Creates the deterministic payment record used by the academic simulation.
 * The caller supplies a Prisma transaction client so payment and order state
 * are committed atomically.
 */
export function createSimulatedPayment(tx, { orderId, amount, method = 'MOCK_GATEWAY' }) {
  return tx.payment.create({
    data: {
      orderId,
      amount,
      method,
      status: 'PAID',
    },
  });
}
