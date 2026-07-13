import { Router } from 'express';
import * as partnersController from './partners.controller.js';
import * as redeemController from '../redeem/redeem.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import reportsRouter from '../reports/reports.routes.js';

const router = Router();

router.use(verifyToken, requireRole('PARTNER'));

router.get('/profile', partnersController.getProfile);
router.put('/profile', partnersController.updateProfile);

router.get('/branches', partnersController.getBranches);
router.post('/branches', partnersController.createBranch);
router.put('/branches/:id', partnersController.updateBranch);
router.delete('/branches/:id', partnersController.deleteBranch);

router.get('/vouchers', partnersController.getPartnerVouchers);
router.post('/vouchers', partnersController.createVoucher);
router.put('/vouchers/:id', partnersController.updateVoucher);
router.post('/vouchers/:id/submit', partnersController.submitVoucher);

/**
 * @swagger
 * /api/partner/redeem:
 *   post:
 *     summary: Đổi mã voucher tại một chi nhánh cụ thể
 *     tags:
 *       - Partners
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, branchId]
 *             properties:
 *               code:
 *                 type: string
 *               branchId:
 *                 type: string
 *                 description: Chi nhánh hoạt động và được gắn với voucher
 *     responses:
 *       200:
 *         description: Đổi mã thành công
 *       400:
 *         description: Mã đã dùng, hết hạn, bị huỷ hoặc bị khoá
 *       403:
 *         description: Sai partner hoặc chi nhánh nằm ngoài phạm vi voucher
 *       404:
 *         description: Không tìm thấy mã voucher
 */
router.post('/redeem', redeemController.redeemVoucherCode);

router.use('/reports', reportsRouter);

export default router;
