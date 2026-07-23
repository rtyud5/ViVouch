import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import * as controller from './notifications.controller.js';

const router = Router();
router.use(verifyToken);
router.get('/', controller.list);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);
export default router;
