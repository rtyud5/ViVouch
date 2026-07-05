import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { VOUCHER_CODE_STATUS } from '../../constants/statuses.js';

const pad = (n) => n.toString().padStart(2, '0');
const formatDate = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

export const getPartnerReports = async (userId, rangeDays = 30) => {
  const partner = await prisma.partner.findUnique({
    where: { userId },
  });

  if (!partner) {
    throw new AppError('Partner không tồn tại', 404, 'PARTNER_NOT_FOUND');
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setUTCHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - rangeDays + 1);
  startDate.setUTCHours(0, 0, 0, 0);

  const vouchers = await prisma.voucher.findMany({
    where: { partnerId: partner.id },
    select: { id: true, title: true },
  });
  const voucherIds = vouchers.map((v) => v.id);

  if (voucherIds.length === 0) {
    return {
      summary: { revenue: 0, orders: 0, customers: 0, conversion: 0 },
      revenueByDay: [],
      topVouchers: [],
    };
  }

  const orderFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    status: 'COMPLETED',
  };

  const [orderItems, voucherCodes] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        voucherId: { in: voucherIds },
        order: orderFilter,
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.voucherCode.findMany({
      where: {
        voucherId: { in: voucherIds },
        order: orderFilter,
      },
      select: { status: true },
    }),
  ]);

  let totalRevenue = 0;
  const totalOrdersSet = new Set();
  const totalCustomersSet = new Set();

  const dailyDataMap = new Map();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(startDate);
    d.setUTCDate(startDate.getUTCDate() + i);
    const dateStr = formatDate(d);
    dailyDataMap.set(dateStr, {
      date: dateStr,
      revenue: 0,
      orderIds: new Set(),
      customerIds: new Set(),
    });
  }

  const voucherTitleMap = new Map(vouchers.map((v) => [v.id, v.title]));
  const topVouchersMap = new Map();

  for (const item of orderItems) {
    const revenue = item.qty * item.unitPrice;
    totalRevenue += revenue;

    totalOrdersSet.add(item.orderId);
    totalCustomersSet.add(item.order.userId);

    const dateStr = formatDate(new Date(item.order.createdAt));
    if (dailyDataMap.has(dateStr)) {
      const dayData = dailyDataMap.get(dateStr);
      dayData.revenue += revenue;
      dayData.orderIds.add(item.orderId);
      dayData.customerIds.add(item.order.userId);
    }

    if (!topVouchersMap.has(item.voucherId)) {
      const vTitle = voucherTitleMap.get(item.voucherId) || 'Unknown Voucher';
      topVouchersMap.set(item.voucherId, {
        id: item.voucherId,
        name: vTitle,
        revenue: 0,
        orderIds: new Set(),
        count: 0,
      });
    }

    const tv = topVouchersMap.get(item.voucherId);
    tv.revenue += revenue;
    tv.count += item.qty;
    tv.orderIds.add(item.orderId);
  }

  const revenueByDay = Array.from(dailyDataMap.values()).map((v) => ({
    date: v.date,
    revenue: v.revenue,
    orders: v.orderIds.size,
    customers: v.customerIds.size,
  }));

  const topVouchers = Array.from(topVouchersMap.values())
    .map(({ orderIds, ...rest }) => ({ ...rest, orders: orderIds.size }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const soldCount = voucherCodes.length;
  const redeemedCount = voucherCodes.filter((code) => code.status === VOUCHER_CODE_STATUS.USED).length;
  const conversion = soldCount > 0
    ? Number(((redeemedCount / soldCount) * 100).toFixed(1))
    : 0;

  return {
    summary: {
      revenue: totalRevenue,
      orders: totalOrdersSet.size,
      customers: totalCustomersSet.size,
      conversion,
    },
    revenueByDay,
    topVouchers,
  };
};
