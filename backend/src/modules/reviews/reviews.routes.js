import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as reviewsController from './reviews.controller.js';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /api/vouchers/{id}/reviews:
 *   get:
 *     summary: Lay danh sach review cua voucher
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lay reviews thanh cong
 *       404:
 *         description: Voucher khong ton tai
 */
router.get('/', reviewsController.getByVoucher);

router.get(
  '/eligibility',
  verifyToken,
  requireRole('CUSTOMER'),
  reviewsController.getEligibility,
);

/**
 * @swagger
 * /api/vouchers/{id}/reviews:
 *   post:
 *     summary: Tao review cho voucher da su dung
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Tao review thanh cong
 *       403:
 *         description: Customer chua su dung voucher
 *       409:
 *         description: Customer da review voucher nay
 */
router.post('/', verifyToken, requireRole('CUSTOMER'), reviewsController.create);

export default router;
