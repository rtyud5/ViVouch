import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { getPartnerByUserId } from '../partners/partners.service.js';
import { canTransition } from '../../utils/stateMachine.js';
import { VOUCHER_STATUS, voucherTransitions } from '../../constants/statuses.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (decimal) => Number(decimal);

const calcDiscount = (original, sale) =>
  original > 0 ? Math.round((1 - sale / original) * 100) : 0;

function mapVoucherSummary(v, avgRating) {
  const originalPrice = toNum(v.originalPrice);
  const salePrice = toNum(v.salePrice);

  return {
    id: v.id,
    title: v.title,
    imageUrl: v.imageUrl,
    originalPrice,
    salePrice,
    discountPct: calcDiscount(originalPrice, salePrice),
    remainingQty: Math.max(0, v.totalQty - v.soldQty),
    soldQty: v.soldQty,
    avgRating,
    reviewCount: v._count?.reviews || 0,
    partner: { businessName: v.partner.businessName },
    category: { name: v.category.name, icon: v.category.icon },
  };
}

// ── findMany ─────────────────────────────────────────────────────────────────

export async function findMany(filters) {
  try {
    const { page, limit, keyword, categoryId, city, minPrice, maxPrice, minDiscount, sort } = filters;

    const conditions = [Prisma.sql`v.status = 'ON_SALE'`];

    if (keyword) conditions.push(Prisma.sql`v.title ILIKE ${'%' + keyword + '%'}`);
    if (categoryId) conditions.push(Prisma.sql`v."categoryId" = ${categoryId}`);
    if (city) {
      conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "VoucherBranch" vb
      JOIN "Branch" b ON vb."branchId" = b.id
      WHERE vb."voucherId" = v.id AND b.city ILIKE ${'%' + city + '%'}
    )`);
    }
    if (minPrice !== undefined) conditions.push(Prisma.sql`v."salePrice" >= ${minPrice}`);
    if (maxPrice !== undefined) conditions.push(Prisma.sql`v."salePrice" <= ${maxPrice}`);
    if (minDiscount !== undefined) {
      conditions.push(Prisma.sql`(v."originalPrice" > 0 AND ROUND((1 - (v."salePrice" / v."originalPrice")) * 100) >= ${minDiscount})`);
    }

    const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    // 1. Raw aggregate for accurate Total Count
    const countQuery = Prisma.sql`SELECT CAST(COUNT(*) AS INTEGER) as total FROM "Voucher" v ${where}`;
    const countResult = await prisma.$queryRaw(countQuery);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // 2. Fetch paginated IDs with safe DB-level ordering
    let orderBy = Prisma.sql`ORDER BY v."soldQty" DESC`;
    if (sort === 'newest') orderBy = Prisma.sql`ORDER BY v."createdAt" DESC`;
    if (sort === 'price_asc') orderBy = Prisma.sql`ORDER BY v."salePrice" ASC`;
    if (sort === 'price_desc') orderBy = Prisma.sql`ORDER BY v."salePrice" DESC`;

    const skipVal = (page - 1) * limit;
    const idsQuery = Prisma.sql`
    SELECT v.id FROM "Voucher" v
    ${where}
    ${orderBy}
    LIMIT ${limit} OFFSET ${skipVal}
  `;
    const idsResult = await prisma.$queryRaw(idsQuery);
    const ids = idsResult.map((row) => row.id);

    // 3. Fetch structured data via Prisma taking advantage of relations
    let data = [];
    if (ids.length > 0) {
      const vouchers = await prisma.voucher.findMany({
        where: { id: { in: ids } },
        include: {
          partner: { select: { businessName: true } },
          category: { select: { name: true, icon: true } },
          _count: { select: { reviews: true } }
        }
      });

      const reviewsAgg = await prisma.review.groupBy({
        by: ['voucherId'],
        where: { voucherId: { in: ids } },
        _avg: { rating: true }
      });

      const avgMap = {};
      for (const agg of reviewsAgg) {
        avgMap[agg.voucherId] = agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0;
      }

      // Preserve the DB sorting order from the raw IDs array
      data = ids.map(id => {
        const v = vouchers.find(x => x.id === id);
        return mapVoucherSummary(v, avgMap[id] || 0);
      });
    }

    return {
      data,
      pagination: { page, limit, total, totalPages },
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new AppError('Lỗi truy vấn danh sách voucher', 500, 'QUERY_ERROR');
  }
}

// ── findById ─────────────────────────────────────────────────────────────────

export async function findById(id) {
  const voucher = await prisma.voucher.findUnique({
    where: { id },
    include: {
      partner: { select: { businessName: true, taxCode: true } },
      category: { select: { id: true, name: true, slug: true, icon: true } },
      voucherBranches: {
        include: {
          branch: { select: { id: true, name: true, address: true, city: true } },
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!voucher || voucher.status !== 'ON_SALE') {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  const originalPrice = toNum(voucher.originalPrice);
  const salePrice = toNum(voucher.salePrice);

  const ratings = voucher.reviews.map((r) => r.rating);
  const avgRating = ratings.length
    ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
    : 0;
  const totalCount = voucher._count.reviews;

  return {
    id: voucher.id,
    title: voucher.title,
    description: voucher.description,
    imageUrl: voucher.imageUrl,
    originalPrice,
    salePrice,
    discountPct: calcDiscount(originalPrice, salePrice),
    totalQty: voucher.totalQty,
    soldQty: voucher.soldQty,
    remainingQty: Math.max(0, voucher.totalQty - voucher.soldQty),
    saleStart: voucher.saleStart,
    saleEnd: voucher.saleEnd,
    useStart: voucher.useStart,
    useEnd: voucher.useEnd,
    conditions: voucher.conditions,
    cancelPolicy: voucher.cancelPolicy,
    partner: voucher.partner,
    category: voucher.category,
    branches: voucher.voucherBranches.map((vb) => vb.branch),
    reviews: voucher.reviews,
    reviewSummary: { avgRating, totalCount },
  };
}

// ── Partner Voucher Management ───────────────────────────────────────────────

export async function createVoucher(userId, data) {
  const partner = await getPartnerByUserId(userId);
  return prisma.voucher.create({
    data: {
      ...data,
      partnerId: partner.id,
      status: VOUCHER_STATUS.DRAFT
    }
  });
}

export async function updateVoucher(userId, voucherId, data) {
  const partner = await getPartnerByUserId(userId);
  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });

  if (!voucher) throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  if (voucher.partnerId !== partner.id) throw new AppError('Không có quyền sửa voucher này', 403, 'FORBIDDEN');
  if (![VOUCHER_STATUS.DRAFT, VOUCHER_STATUS.REJECTED].includes(voucher.status)) {
    throw new AppError('Chỉ được sửa voucher khi ở trạng thái DRAFT hoặc REJECTED', 400, 'INVALID_STATUS_TRANSITION');
  }

  // Validator chỉ check salePrice < originalPrice khi cả 2 field cùng có trong payload.
  // Nếu Partner chỉ gửi 1 trong 2 field, phải đối chiếu với giá trị hiện tại trong DB
  // để tránh lọt trường hợp giá bán >= giá gốc sau khi update một phần.
  const nextOriginalPrice = data.originalPrice ?? toNum(voucher.originalPrice);
  const nextSalePrice = data.salePrice ?? toNum(voucher.salePrice);
  if (nextSalePrice >= nextOriginalPrice) {
    throw new AppError('salePrice phải nhỏ hơn originalPrice', 400, 'INVALID_PRICE');
  }

  return prisma.voucher.update({
    where: { id: voucherId },
    data
  });
}

export async function submitVoucher(userId, voucherId) {
  const partner = await getPartnerByUserId(userId);
  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });

  if (!voucher) throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  if (voucher.partnerId !== partner.id) throw new AppError('Không có quyền thao tác trên voucher này', 403, 'FORBIDDEN');

  if (!canTransition(voucher.status, VOUCHER_STATUS.PENDING_APPROVAL, voucherTransitions)) {
    throw new AppError('Trạng thái hiện tại không hợp lệ để duyệt', 400, 'INVALID_STATUS_TRANSITION');
  }

  return prisma.$transaction(async (tx) => {
    const updatedVoucher = await tx.voucher.update({
      where: { id: voucherId },
      data: { status: VOUCHER_STATUS.PENDING_APPROVAL }
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: 'SUBMIT_VOUCHER',
        targetType: 'Voucher',
        targetId: voucherId
      }
    });

    return updatedVoucher;
  });
}

export async function findByPartner(userId, filters) {
  const partner = await getPartnerByUserId(userId);
  const { page = 1, limit = 12 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where = { partnerId: partner.id };

  const total = await prisma.voucher.count({ where });

  const vouchers = await prisma.voucher.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: Number(limit),
  });

  if (vouchers.length === 0) {
    return {
      data: [],
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: 0 }
    };
  }

  const voucherIds = vouchers.map(v => v.id);

  const usedCountAgg = await prisma.voucherCode.groupBy({
    by: ['voucherId'],
    where: { voucherId: { in: voucherIds }, status: 'USED' },
    _count: { _all: true }
  });

  const usedCountMap = {};
  for (const agg of usedCountAgg) {
    usedCountMap[agg.voucherId] = agg._count._all;
  }

  const data = vouchers.map(v => ({
    ...v,
    usedCount: usedCountMap[v.id] || 0
  }));

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}