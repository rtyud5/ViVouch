import * as partnersService from './partners.service.js';
import * as vouchersService from '../vouchers/vouchers.service.js';
import { updateProfileSchema, createBranchSchema, updateBranchSchema } from './partners.validator.js';
import { createVoucherSchema, updateVoucherSchema, partnerVoucherFiltersSchema } from '../vouchers/vouchers.validator.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await partnersService.getProfile(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const updated = await partnersService.updateProfile(req.user.userId, validatedData);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getBranches(req, res, next) {
  try {
    const branches = await partnersService.getBranches(req.user.userId);
    res.json({ success: true, data: branches });
  } catch (err) {
    next(err);
  }
}

export async function createBranch(req, res, next) {
  try {
    const validatedData = createBranchSchema.parse(req.body);
    const branch = await partnersService.createBranch(req.user.userId, validatedData);
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    next(err);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const validatedData = updateBranchSchema.parse(req.body);
    const branch = await partnersService.updateBranch(req.user.userId, req.params.id, validatedData);
    res.json({ success: true, data: branch });
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
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function createVoucher(req, res, next) {
  try {
    const validatedData = createVoucherSchema.parse(req.body);
    const voucher = await vouchersService.createVoucher(req.user.userId, validatedData);
    res.status(201).json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function updateVoucher(req, res, next) {
  try {
    const validatedData = updateVoucherSchema.parse(req.body);
    const voucher = await vouchersService.updateVoucher(req.user.userId, req.params.id, validatedData);
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
}

export async function submitVoucher(req, res, next) {
  try {
    const voucher = await vouchersService.submitVoucher(req.user.userId, req.params.id);
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
}
