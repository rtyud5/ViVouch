import { Router } from 'express';
import * as vouchersController from './vouchers.controller.js';
import reviewsRouter from '../reviews/reviews.routes.js';

const router = Router();

router.get('/', vouchersController.getAll);
router.use('/:id/reviews', reviewsRouter);
router.get('/:id', vouchersController.getById);

export default router;
