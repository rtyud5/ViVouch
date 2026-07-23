import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as controller from './payment.controller.js';

const router = Router();
router.post('/payos/webhook', controller.payOsWebhook);
router.get('/:orderId/status', verifyToken, requireRole('CUSTOMER'), controller.status);
export default router;
