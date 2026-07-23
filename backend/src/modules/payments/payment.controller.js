import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './payment.service.js';

export const status = asyncHandler(async (req, res) => {
  const data = await service.getPaymentStatus(req.user.userId, req.params.orderId);
  res.json({ success: true, data });
});

export const payOsWebhook = asyncHandler(async (req, res) => {
  const data = await service.processPayOsWebhook(req.body);
  res.status(200).json({ success: true, data });
});
