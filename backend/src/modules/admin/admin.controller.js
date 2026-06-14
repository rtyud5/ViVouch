import * as adminService from './admin.service.js';
import { rejectSchema, idParamSchema } from './admin.validator.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const approvePartner = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await adminService.approvePartner(req.user.userId, id);
  res.json({ success: true, message: 'OK', data });
});

export const rejectPartner = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { reason } = rejectSchema.parse(req.body);
  const data = await adminService.rejectPartner(req.user.userId, id, reason);
  res.json({ success: true, message: 'OK', data });
});

export const approveVoucher = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await adminService.approveVoucher(req.user.userId, id);
  res.json({ success: true, message: 'OK', data });
});

export const rejectVoucher = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { reason } = rejectSchema.parse(req.body);
  const data = await adminService.rejectVoucher(req.user.userId, id, reason);
  res.json({ success: true, message: 'OK', data });
});
