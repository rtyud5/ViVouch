import { asyncHandler } from '../../utils/asyncHandler.js';
import { redeemCode } from './redeem.service.js';
import { redeemVoucherCodeSchema } from './redeem.validator.js';

export const redeemVoucherCode = asyncHandler(async (req, res) => {
  const { code, branchId } = redeemVoucherCodeSchema.parse(req.body);
  const result = await redeemCode(req.user.userId, code, branchId);

  res.status(200).json({
    success: true,
    message: 'Xác thực voucher thành công',
    data: result,
  });
});
