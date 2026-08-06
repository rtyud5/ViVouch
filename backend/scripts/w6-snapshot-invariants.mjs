import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const prisma = new PrismaClient();

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
      auditLogs: await prisma.auditLog.count()
    };

    // Invariants
    const orphans = {
      orderItemsWithoutOrder: 0,
      paymentsWithoutOrder: 0,
      voucherCodesWithoutOrder: 0
    };

    // Staff missing branch
    const staffWithoutBranch = await prisma.partnerMember.count({
      where: { role: 'STAFF', branchId: null }
    });

    const report = {
      counts,
      invariants: {
        totalOrphans: Object.values(orphans).reduce((a, b) => a + b, 0),
        staffWithoutBranch,
        details: orphans
      },
      timestamp: new Date().toISOString()
    };

    const outPath = process.argv[2] || 'snapshot.json';
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Snapshot saved to ${outPath}`);
    
  } catch (error) {
    console.error('Error taking snapshot:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSnapshot();
