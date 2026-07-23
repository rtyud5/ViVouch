import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './notifications.service.js';

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  res.json({ success: true, data: await service.listForUser(req.user.userId, { page, limit }) });
});

export const markRead = asyncHandler(async (req, res) => {
  const updated = await service.markRead(req.user.userId, req.params.id);
  res.status(updated ? 200 : 404).json({ success: updated, message: updated ? 'Đã đánh dấu đã đọc' : 'Không tìm thấy thông báo' });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user.userId);
  res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
});
