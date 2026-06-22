import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/partners', adminController.getPartners);
router.post('/partners/:id/approve', adminController.approvePartner);
router.post('/partners/:id/reject', adminController.rejectPartner);

router.get('/vouchers', adminController.getVouchers);
router.post('/vouchers/:id/approve', adminController.approveVoucher);
router.post('/vouchers/:id/reject', adminController.rejectVoucher);

router.get('/users', adminController.getUsers);
router.post('/users/:id/toggle-lock', adminController.toggleUserLock);

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);

router.get('/audit-logs', adminController.getAuditLogs);

export default router;
