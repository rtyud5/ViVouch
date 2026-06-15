import { asyncHandler } from '../../utils/asyncHandler.js';
import * as vouchersService from './vouchers.service.js';
import { listVouchersSchema, getVoucherByIdSchema } from './vouchers.validator.js';

export const getAll = asyncHandler(async (req, res) => {
  const filters = listVouchersSchema.parse(req.query);
  const result  = await vouchersService.findMany(filters);
  res.json({ success: true, message: 'OK', ...result });
});

export const getById = asyncHandler(async (req, res) => {
  const { id } = getVoucherByIdSchema.parse(req.params);
  const data   = await vouchersService.findById(id);
  res.json({ success: true, message: 'OK', data });
});
