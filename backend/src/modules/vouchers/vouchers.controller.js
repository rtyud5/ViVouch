import * as vouchersService from './vouchers.service.js';
import { listVouchersSchema, getVoucherByIdSchema } from './vouchers.validator.js';

export async function getAll(req, res, next) {
  try {
    const filters = listVouchersSchema.parse(req.query);
    const result  = await vouchersService.findMany(filters);
    res.json({ success: true, message: 'OK', ...result });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = getVoucherByIdSchema.parse(req.params);
    const data   = await vouchersService.findById(id);
    res.json({ success: true, message: 'OK', data });
  } catch (err) {
    next(err);
  }
}
