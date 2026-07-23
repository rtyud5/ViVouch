import * as adminService from './admin.service.js';
import { rejectSchema, roleSchema, partnerStatusSchema, cancelOrderSchema, idParamSchema, ordersQuerySchema, partnersQuerySchema, vouchersQuerySchema, auditLogsQuerySchema, walletAdjustmentSchema } from './admin.validator.js';
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
  const { page = 1, limit = 10, status, search } = partnersQuerySchema.parse(req.query);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyPartners(
    { status, search },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const getVouchers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = vouchersQuerySchema.parse(req.query);
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

export const assignUserRole = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { role } = roleSchema.parse(req.body);
  const data = await adminService.assignUserRole(req.user.userId, id, role);
  res.json({ success: true, message: 'Đã cập nhật vai trò', data });
});

export const setPartnerStatus = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { status, reason } = partnerStatusSchema.parse(req.body);
  const data = await adminService.setPartnerStatus(req.user.userId, id, status, reason);
  res.json({ success: true, message: 'Đã cập nhật trạng thái đối tác', data });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = ordersQuerySchema.parse(req.query);
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

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { reason } = cancelOrderSchema.parse(req.body);
  const data = await adminService.cancelOrder(req.user.userId, id, reason);
  res.json({ success: true, message: 'Đã hủy đơn và mô phỏng hoàn tiền', data });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, action, targetType, actorId, dateFrom, dateTo } = auditLogsQuerySchema.parse(req.query);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const data = await adminService.findManyAuditLogs(
    { action, targetType, actorId, dateFrom, dateTo },
    { page: pageNum, limit: limitNum }
  );
  res.json({ success: true, data });
});

export const adjustWallet = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = walletAdjustmentSchema.parse(req.body);
  res.json({ success: true, message: 'Đã điều chỉnh số dư Ví ViVouch', data: await adminService.adjustWallet(req.user.userId, id, data) });
});
