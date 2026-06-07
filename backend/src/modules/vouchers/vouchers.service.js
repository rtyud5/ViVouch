import { prisma } from '../../config/prisma.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert Prisma Decimal to JS Number */
const toNum = (decimal) => Number(decimal);

/** discountPct = round((1 - sale/original) * 100) */
const calcDiscount = (original, sale) =>
  Math.round((1 - sale / original) * 100);

/** Map a raw voucher row into the public‐API shape */
function mapVoucherSummary(v) {
  const originalPrice = toNum(v.originalPrice);
  const salePrice     = toNum(v.salePrice);
  const ratings       = (v.reviews ?? []).map((r) => r.rating);
  const avgRating     = ratings.length
    ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : 0;

  return {
    id:            v.id,
    title:         v.title,
    imageUrl:      v.imageUrl,
    originalPrice,
    salePrice,
    discountPct:   calcDiscount(originalPrice, salePrice),
    remainingQty:  v.totalQty - v.soldQty,
    soldQty:       v.soldQty,
    avgRating,
    reviewCount:   ratings.length,
    partner:       { businessName: v.partner.businessName },
    category:      { name: v.category.name, icon: v.category.icon },
  };
}

// ── Sort map ─────────────────────────────────────────────────────────────────

const SORT_MAP = {
  popularity: { soldQty: 'desc' },
  newest:     { createdAt: 'desc' },
  price_asc:  { salePrice: 'asc' },
  price_desc: { salePrice: 'desc' },
};

// ── findMany ─────────────────────────────────────────────────────────────────

export async function findMany(filters) {
  const { page, limit, keyword, categoryId, city, minPrice, maxPrice, minDiscount, sort } = filters;

  // ── Build WHERE clause ── always only ON_SALE ──
  const where = { status: 'ON_SALE' };

  if (keyword) {
    where.title = { contains: keyword, mode: 'insensitive' };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (city) {
    where.voucherBranches = {
      some: { branch: { city: { contains: city, mode: 'insensitive' } } },
    };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.salePrice = {};
    if (minPrice !== undefined) where.salePrice.gte = minPrice;
    if (maxPrice !== undefined) where.salePrice.lte = maxPrice;
  }

  // ── Include relations needed for mapping ──
  const include = {
    partner:  { select: { businessName: true } },
    category: { select: { name: true, icon: true } },
    reviews:  { select: { rating: true } },
  };

  // ── Run count + findMany in parallel ──
  const skip = (page - 1) * limit;

  const [total, vouchers] = await Promise.all([
    prisma.voucher.count({ where }),
    prisma.voucher.findMany({
      where,
      include,
      orderBy: SORT_MAP[sort] ?? SORT_MAP.popularity,
      skip,
      take: limit,
    }),
  ]);

  // ── Post‐query: minDiscount filter (needs computed field) ──
  let data = vouchers.map(mapVoucherSummary);

  if (minDiscount !== undefined) {
    data = data.filter((v) => v.discountPct >= minDiscount);
  }

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: { page, limit, total, totalPages },
  };
}

// ── findById ─────────────────────────────────────────────────────────────────

export async function findById(id) {
  const voucher = await prisma.voucher.findUnique({
    where: { id },
    include: {
      partner:  { select: { businessName: true, taxCode: true } },
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
    },
  });

  // Guard: must exist AND be ON_SALE
  if (!voucher || voucher.status !== 'ON_SALE') {
    const err = new Error('Voucher not found');
    err.statusCode = 404;
    throw err;
  }

  const originalPrice = toNum(voucher.originalPrice);
  const salePrice     = toNum(voucher.salePrice);

  const ratings  = voucher.reviews.map((r) => r.rating);
  const avgRating = ratings.length
    ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : 0;

  return {
    id:            voucher.id,
    title:         voucher.title,
    description:   voucher.description,
    imageUrl:      voucher.imageUrl,
    originalPrice,
    salePrice,
    discountPct:   calcDiscount(originalPrice, salePrice),
    totalQty:      voucher.totalQty,
    soldQty:       voucher.soldQty,
    remainingQty:  voucher.totalQty - voucher.soldQty,
    saleStart:     voucher.saleStart,
    saleEnd:       voucher.saleEnd,
    useStart:      voucher.useStart,
    useEnd:        voucher.useEnd,
    conditions:    voucher.conditions,
    cancelPolicy:  voucher.cancelPolicy,
    partner:       voucher.partner,
    category:      voucher.category,
    branches:      voucher.voucherBranches.map((vb) => vb.branch),
    reviews:       voucher.reviews,
    reviewSummary: { avgRating, totalCount: ratings.length },
  };
}
