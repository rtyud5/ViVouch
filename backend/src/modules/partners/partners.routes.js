import { Router } from 'express';
import * as partnersController from './partners.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

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

export default router;
