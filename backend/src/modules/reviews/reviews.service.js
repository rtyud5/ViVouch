import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../../constants/statuses.js';
import { AppError } from '../../utils/appError.js';

function mapReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    user: {
      id: review.user.id,
      fullName: review.user.fullName,
    },
  };
}

async function assertVoucherCanShowReviews(voucherId, db = prisma) {
  const voucher = await db.voucher.findUnique({
    where: { id: voucherId },
    select: { id: true, status: true },
  });

  const allowedStatuses = [
    VOUCHER_STATUS.ON_SALE,
    VOUCHER_STATUS.PAUSED,
    VOUCHER_STATUS.EXPIRED,
    VOUCHER_STATUS.SUSPENDED,
  ];

  if (!voucher || !allowedStatuses.includes(voucher.status)) {
    throw new AppError('Voucher not found', 404, 'VOUCHER_NOT_FOUND');
  }

  return voucher;
}

export async function getByVoucher(voucherId, { page = 1, limit = 10 } = {}) {
  await assertVoucherCanShowReviews(voucherId);

  const skip = (page - 1) * limit;

  const [reviews, ratingSummary] = await Promise.all([
    prisma.review.findMany({
      where: { voucherId },
      include: {
        user: { select: { id: true, fullName: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.review.aggregate({
      where: { voucherId },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  const totalCount = ratingSummary._count.id;
  const avgRating = ratingSummary._avg.rating
    ? Number(ratingSummary._avg.rating.toFixed(1))
    : 0;

  return {
    reviews: reviews.map(mapReview),
    avgRating,
    totalCount,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function createReview(userId, voucherId, data) {
  try {
    const created = await prisma.$transaction(async (tx) => {
      await assertVoucherCanShowReviews(voucherId, tx);

      const existingReview = await tx.review.findUnique({
        where: { userId_voucherId: { userId, voucherId } },
        select: { id: true },
      });

      if (existingReview) {
        throw new AppError('Bạn đã đánh giá voucher này rồi', 409, 'REVIEW_ALREADY_EXISTS');
      }

      const usedCode = await tx.voucherCode.findFirst({
        where: {
          ownerId: userId,
          voucherId,
          status: VOUCHER_CODE_STATUS.USED,
        },
        select: { id: true, code: true },
      });

      if (!usedCode) {
        throw new AppError('Bạn cần sử dụng voucher trước khi đánh giá', 403, 'VOUCHER_NOT_USED');
      }

      const review = await tx.review.create({
        data: {
          userId,
          voucherId,
          rating: data.rating,
          comment: data.comment || null,
        },
        include: {
          user: { select: { id: true, fullName: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AUDIT_ACTIONS.CUSTOMER_CREATE_REVIEW,
          targetType: 'Review',
          targetId: review.id,
          metadata: {
            voucherId,
            voucherCodeId: usedCode.id,
            rating: review.rating,
          },
        },
      });

      return {
        review: mapReview(review),
      };
    });

    const ratingSummary = await prisma.review.aggregate({
      where: { voucherId },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      ...created,
      avgRating: ratingSummary._avg.rating
        ? Number(ratingSummary._avg.rating.toFixed(1))
        : 0,
      totalCount: ratingSummary._count.id,
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError('Bạn đã đánh giá voucher này rồi', 409, 'REVIEW_ALREADY_EXISTS');
    }
    throw err;
  }
}
