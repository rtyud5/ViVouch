import { asyncHandler } from '../../utils/asyncHandler.js';
import * as reviewsService from './reviews.service.js';
import {
  createReviewSchema,
  listReviewsQuerySchema,
  voucherReviewParamsSchema,
} from './reviews.validator.js';

export const getByVoucher = asyncHandler(async (req, res) => {
  const { id } = voucherReviewParamsSchema.parse(req.params);
  const query = listReviewsQuerySchema.parse(req.query);
  const result = await reviewsService.getByVoucher(id, query);

  res.json({
    success: true,
    message: 'OK',
    data: {
      reviews: result.reviews,
      avgRating: result.avgRating,
      totalCount: result.totalCount,
      pagination: result.pagination,
    },
  });
});

export const create = asyncHandler(async (req, res) => {
  const { id } = voucherReviewParamsSchema.parse(req.params);
  const body = createReviewSchema.parse(req.body);
  const result = await reviewsService.createReview(req.user.userId, id, body);

  res.status(201).json({
    success: true,
    message: 'Đánh giá thành công',
    data: result.review,
  });
});

export const getEligibility = asyncHandler(async (req, res) => {
  const { id } = voucherReviewParamsSchema.parse(req.params);
  const result = await reviewsService.getEligibility(req.user.userId, id);

  res.json({
    success: true,
    message: 'OK',
    data: result,
  });
});
