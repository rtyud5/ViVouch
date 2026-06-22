import * as adminService from './admin.service.js';
import { rejectSchema, idParamSchema } from './admin.validator.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();
  res.json({ success: true, data });
});

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

export const getPartners = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyPartners(
    { status, search },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const getVouchers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyVouchers(
    { status, search },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isLocked, search } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyUsers(
    { role, isLocked, search },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const toggleUserLock = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await adminService.toggleUserLock(req.user.userId, id);
  res.json({ success: true, message: 'OK', data });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyOrders(
    { status, search },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await adminService.findOrderById(id);
  res.json({ success: true, data });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, action, targetType } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyAuditLogs(
    { action, targetType },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});
