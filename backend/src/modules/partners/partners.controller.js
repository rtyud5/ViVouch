import * as partnersService from './partners.service.js';
import * as vouchersService from '../vouchers/vouchers.service.js';
import { redeemCode } from '../voucherCodes/voucherCodes.service.js';
import { updateProfileSchema, createBranchSchema, updateBranchSchema } from './partners.validator.js';
import { createVoucherSchema, updateVoucherSchema, partnerVoucherFiltersSchema } from '../vouchers/vouchers.validator.js';
import { redeemVoucherCodeSchema } from '../voucherCodes/voucherCodes.validator.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await partnersService.getProfile(req.user.userId);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await partnersService.updateProfile(req.user.userId, validatedData);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getBranches(req, res, next) {
  try {
    const branches = await partnersService.getBranches(req.user.userId);
    res.json({ data: branches });
  } catch (err) {
    next(err);
  }
}

export async function createBranch(req, res, next) {
  try {
    const validatedData = createBranchSchema.parse(req.body);
    const branch = await partnersService.createBranch(req.user.userId, validatedData);
    res.status(201).json({ data: branch });
  } catch (err) {
    next(err);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const validatedData = updateBranchSchema.parse(req.body);
    const branch = await partnersService.updateBranch(req.user.userId, req.params.id, validatedData);
    res.json({ data: branch });
  } catch (err) {
    next(err);
  }
}

export async function deleteBranch(req, res, next) {
  try {
    await partnersService.deleteBranch(req.user.userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getPartnerVouchers(req, res, next) {
  try {
    const filters = partnerVoucherFiltersSchema.parse(req.query);
    const result = await vouchersService.findByPartner(req.user.userId, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createVoucher(req, res, next) {
  try {
    const validatedData = createVoucherSchema.parse(req.body);
    const voucher = await vouchersService.createVoucher(req.user.userId, validatedData);
    res.status(201).json({ data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function updateVoucher(req, res, next) {
  try {
    const validatedData = updateVoucherSchema.parse(req.body);
    const voucher = await vouchersService.updateVoucher(req.user.userId, req.params.id, validatedData);
    res.json({ data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function submitVoucher(req, res, next) {
  try {
    const voucher = await vouchersService.submitVoucher(req.user.userId, req.params.id);
    res.json({ data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function redeemVoucherCode(req, res, next) {
  try {
    const parsed = redeemVoucherCodeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Thiếu mã voucher' });

    const result = await redeemCode(req.user.userId, parsed.data.code);
    res.json({ success: true, message: 'Xác nhận thành công', data: result });
  } catch (err) {
    next(err);
  }
}
