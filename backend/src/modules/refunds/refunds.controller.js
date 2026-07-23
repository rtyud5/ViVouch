import { asyncHandler } from '../../utils/asyncHandler.js';
import { createRefundSchema, resolveRefundSchema, completeManualRefundSchema } from './refunds.validator.js';
import * as service from './refunds.service.js';

export const create = asyncHandler(async (req, res) => {
  const data = createRefundSchema.parse(req.body);
  res.status(201).json({ success: true, data: await service.createRefundRequest(req.user.userId, data) });
});
export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listUserRefunds(req.user.userId) });
});
export const adminList = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  res.json({ success: true, data: await service.listAdminRefunds({ status: req.query.status, page, limit }) });
});
export const approve = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.approveRefund(req.user.userId, req.params.id, resolveRefundSchema.parse(req.body)) });
});
export const reject = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.rejectRefund(req.user.userId, req.params.id, resolveRefundSchema.parse(req.body)) });
});
export const complete = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.completeManualRefund(req.user.userId, req.params.id, completeManualRefundSchema.parse(req.body)) });
});
