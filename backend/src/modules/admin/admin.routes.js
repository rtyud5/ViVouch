import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.post('/partners/:id/approve', adminController.approvePartner);
router.post('/partners/:id/reject', adminController.rejectPartner);
router.post('/vouchers/:id/approve', adminController.approveVoucher);
router.post('/vouchers/:id/reject', adminController.rejectVoucher);

export default router;
