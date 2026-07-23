import { asyncHandler } from '../../utils/asyncHandler.js';
import { createStaffSchema, updateStaffSchema } from './partnerMembers.validator.js';
import * as service from './partnerMembers.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listStaff(req.partnerAccess.partnerId) });
});

export const create = asyncHandler(async (req, res) => {
  const data = createStaffSchema.parse(req.body);
  const created = await service.createStaff(req.user.userId, req.partnerAccess.partnerId, data);
  const message = created.delivery.otp
    ? 'Đã tạo nhân viên và gửi email thiết lập tài khoản'
    : 'Đã tạo nhân viên nhưng chưa gửi được OTP; có thể gửi lại từ màn hình thiết lập tài khoản';
  res.status(201).json({ success: true, message, data: created });
});

export const update = asyncHandler(async (req, res) => {
  const data = updateStaffSchema.parse(req.body);
  res.json({ success: true, data: await service.updateStaff(req.user.userId, req.partnerAccess.partnerId, req.params.id, data) });
});

export const history = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getStaffRedeemHistory(req.user.userId, req.partnerAccess.branchId) });
});
