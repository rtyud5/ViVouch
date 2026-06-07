import { Router } from 'express';
import * as vouchersController from './vouchers.controller.js';

const router = Router();

router.get('/', vouchersController.getAll);
router.get('/:id', vouchersController.getById);

export default router;
