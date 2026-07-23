import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as controller from './refunds.controller.js';

export const customerRefundRouter = Router();
customerRefundRouter.use(verifyToken, requireRole('CUSTOMER'));
customerRefundRouter.get('/', controller.mine);
customerRefundRouter.post('/', controller.create);

export const adminRefundRouter = Router();
adminRefundRouter.get('/', controller.adminList);
adminRefundRouter.post('/:id/approve', controller.approve);
adminRefundRouter.post('/:id/reject', controller.reject);
adminRefundRouter.post('/:id/complete', controller.complete);
