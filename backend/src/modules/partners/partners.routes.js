import { Router } from 'express';
import * as partnersController from './partners.controller.js';
import * as redeemController from '../redeem/redeem.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { requirePartnerMember, requirePartnerOwner } from '../../middlewares/partnerAccess.middleware.js';
import reportsRouter from '../reports/reports.routes.js';
import staffRouter from '../partnerMembers/partnerMembers.routes.js';
import { redeemCheckRateLimiter, redeemConfirmRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();
router.use(verifyToken, requireRole('PARTNER'));

router.get('/profile', requirePartnerMember({ requireApproved: false }), partnersController.getProfile);
router.put('/profile', requirePartnerOwner({ requireApproved: false }), partnersController.updateProfile);

router.get('/branches', requirePartnerMember(), partnersController.getBranches);
router.post('/branches', requirePartnerOwner(), partnersController.createBranch);
router.put('/branches/:id', requirePartnerOwner(), partnersController.updateBranch);
router.delete('/branches/:id', requirePartnerOwner(), partnersController.deleteBranch);

router.get('/vouchers', requirePartnerOwner(), partnersController.getPartnerVouchers);
router.post('/vouchers', requirePartnerOwner(), partnersController.createVoucher);
router.put('/vouchers/:id', requirePartnerOwner(), partnersController.updateVoucher);
router.post('/vouchers/:id/submit', requirePartnerOwner(), partnersController.submitVoucher);

router.post('/redeem/check', requirePartnerMember(), redeemCheckRateLimiter, redeemController.checkVoucherCode);
router.post('/redeem/confirm', requirePartnerMember(), redeemConfirmRateLimiter, redeemController.confirmVoucherCode);
router.post('/redeem', requirePartnerMember(), redeemConfirmRateLimiter, redeemController.redeemVoucherCode);

router.use('/staff', staffRouter);
router.use('/reports', requirePartnerOwner(), reportsRouter);

export default router;
