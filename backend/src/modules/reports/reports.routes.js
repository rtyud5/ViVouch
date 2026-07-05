import { Router } from 'express';
import * as reportsController from './reports.controller.js';

const router = Router();

/**
 * @swagger
 * /api/partner/reports:
 *   get:
 *     summary: Lấy danh sách báo cáo của đối tác
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: integer
 *           enum: [7, 30, 90]
 *           default: 30
 *     responses:
 *       200:
 *         description: Lấy báo cáo thành công
 */
router.get('/', reportsController.getPartnerReports);

export default router;
