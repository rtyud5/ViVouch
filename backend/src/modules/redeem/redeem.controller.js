import { asyncHandler } from '../../utils/asyncHandler.js';
import { checkCode, confirmCode } from './redeem.service.js';
import { redeemVoucherCodeSchema } from './redeem.validator.js';

export const checkVoucherCode = asyncHandler(async (req, res) => {
  const { code, branchId } = redeemVoucherCodeSchema.parse(req.body);
  const result = await checkCode(req.user.userId, code, branchId);

  res.status(200).json({
    success: true,
    message: 'Mã voucher hợp lệ. Vui lòng xác nhận trước khi sử dụng.',
    data: result,
  });
});

export const confirmVoucherCode = asyncHandler(async (req, res) => {
  const { code, branchId } = redeemVoucherCodeSchema.parse(req.body);
  const result = await confirmCode(req.user.userId, code, branchId);

  res.status(200).json({
    success: true,
    message: 'Xác thực voucher thành công',
    data: result,
  });
});

// Backward-compatible alias. New clients must call /check then /confirm.
export const redeemVoucherCode = confirmVoucherCode;
