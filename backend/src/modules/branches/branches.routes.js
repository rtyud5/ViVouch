import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as controller from './branches.controller.js';

const router = Router();
router.use(verifyToken, requireRole('PARTNER'));
router.get('/', controller.getBranches);
router.post('/', controller.createBranch);
router.put('/:id', controller.updateBranch);
router.delete('/:id', controller.deleteBranch);

export default router;
