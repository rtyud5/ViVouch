import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const prisma = new PrismaClient();

async function countOrphans() {
  const [orderItemsWithoutOrder, paymentsWithoutOrder, voucherCodesWithoutOrder] = await Promise.all([
    prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "OrderItem" oi LEFT JOIN "Order" o ON oi."orderId" = o.id WHERE o.id IS NULL`.then((rows) => rows[0].count),
    prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Payment" p LEFT JOIN "Order" o ON p."orderId" = o.id WHERE o.id IS NULL`.then((rows) => rows[0].count),
    prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "VoucherCode" vc LEFT JOIN "Order" o ON vc."orderId" = o.id WHERE o.id IS NULL`.then((rows) => rows[0].count),
  ]);

  return { orderItemsWithoutOrder, paymentsWithoutOrder, voucherCodesWithoutOrder };
}

async function runSnapshot() {
  try {
    const counts = {
      users: await prisma.user.count(),
      partners: await prisma.partner.count(),
      branches: await prisma.branch.count(),
      vouchers: await prisma.voucher.count(),
      voucherCodes: await prisma.voucherCode.count(),
      orders: await prisma.order.count(),
      payments: await prisma.payment.count(),
      wallets: await prisma.wallet.count(),
      walletTransactions: await prisma.walletTransaction.count(),
      refundRequests: await prisma.refundRequest.count(),
      supportTickets: await prisma.supportTicket.count(),
      notifications: await prisma.notification.count(),
      auditLogs: await prisma.auditLog.count(),
    };

    const orphans = await countOrphans();
    const staffWithoutBranch = await prisma.partnerMember.count({
      where: { role: 'STAFF', branchId: null },
    });

    const totalOrphans = Object.values(orphans).reduce((a, b) => a + b, 0);
    const report = {
      counts,
      invariants: {
        totalOrphans,
        staffWithoutBranch,
        details: orphans,
      },
      timestamp: new Date().toISOString(),
    };

    const outPath = process.argv[2] || 'snapshot.json';
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Snapshot saved to ${outPath}`);

    if (totalOrphans > 0 || staffWithoutBranch > 0) {
      console.error('Invariant check FAILED:', report.invariants);
      process.exit(1);
    }
    console.log('Invariant check PASSED');
  } catch (error) {
    console.error('Error taking snapshot:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSnapshot();
