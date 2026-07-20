import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { getAuditLogs } from '../admin/admin.controller.js';

const router = Router();
router.use(verifyToken, requireRole('ADMIN'));
router.get('/', getAuditLogs);

export default router;
