import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import cmsAdminRouter from '../cms/cms.admin.routes.js';
import { adminRefundRouter } from '../refunds/refunds.routes.js';
import { adminTicketRouter } from '../supportTickets/supportTickets.routes.js';

const router = Router();

router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.use('/content', cmsAdminRouter);
router.use('/refunds', adminRefundRouter);
router.use('/tickets', adminTicketRouter);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/partners', adminController.getPartners);
router.post('/partners/:id/approve', adminController.approvePartner);
router.post('/partners/:id/reject', adminController.rejectPartner);
router.patch('/partners/:id/status', adminController.setPartnerStatus);

router.get('/vouchers', adminController.getVouchers);
router.post('/vouchers/:id/approve', adminController.approveVoucher);
router.post('/vouchers/:id/reject', adminController.rejectVoucher);

router.get('/users', adminController.getUsers);
router.post('/users/:id/toggle-lock', adminController.toggleUserLock);
router.patch('/users/:id/role', adminController.assignUserRole);
router.post('/users/:id/wallet-adjust', adminController.adjustWallet);

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.post('/orders/:id/cancel', adminController.cancelOrder);

router.get('/audit-logs', adminController.getAuditLogs);

export default router;
