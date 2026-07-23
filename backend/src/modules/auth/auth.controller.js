import * as authService from './auth.service.js';
import {
  registerSchema,
  partnerRegisterSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  staffSetupSchema,
} from './auth.validator.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AppError } from '../../utils/appError.js';

function withLegacyUserFields(result) {
  return { ...result.user, ...result };
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(registerSchema.parse(req.body));
  const message = !result.verificationRequired
    ? 'Đăng ký thành công'
    : result.emailDelivered
      ? 'Đã tạo tài khoản. Vui lòng kiểm tra email để nhập OTP.'
      : 'Đã tạo tài khoản nhưng chưa gửi được OTP. Vui lòng dùng chức năng gửi lại mã.';
  res.status(201).json({ success: true, message, data: withLegacyUserFields(result) });
});

export const registerPartner = asyncHandler(async (req, res) => {
  const result = await authService.registerPartner(partnerRegisterSchema.parse(req.body));
  const message = !result.verificationRequired
    ? 'Đã tạo hồ sơ đối tác. Hãy đăng nhập để theo dõi trạng thái phê duyệt.'
    : result.emailDelivered
      ? 'Đã tạo hồ sơ đối tác. Vui lòng xác minh email.'
      : 'Đã tạo hồ sơ đối tác nhưng chưa gửi được OTP. Vui lòng gửi lại mã xác minh.';
  res.status(201).json({ success: true, message, data: withLegacyUserFields(result) });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = verifyEmailSchema.parse(req.body);
  res.json({ success: true, message: 'Xác minh email thành công', data: await authService.verifyEmail(email, otp) });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = resendOtpSchema.parse(req.body);
  await authService.resendVerification(email);
  res.json({ success: true, message: 'Nếu tài khoản đang chờ xác minh, OTP mới đã được gửi.' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  res.json({ success: true, message: 'Đăng nhập thành công', data: await authService.login(email, password) });
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user?.userId) throw new AppError('Chưa xác thực', 401, 'UNAUTHORIZED');
  res.json({ success: true, data: await authService.getMe(req.user.userId) });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  res.json({ success: true, message: 'Làm mới phiên đăng nhập thành công', data: await authService.refreshSession(refreshToken) });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = logoutSchema.parse(req.body || {});
  await authService.logout(req.user.userId, refreshToken);
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.requestPasswordReset(email);
  res.json({ success: true, message: 'Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(email, otp, password);
  res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
});

export const completeStaffSetup = asyncHandler(async (req, res) => {
  const { email, otp, password } = staffSetupSchema.parse(req.body);
  res.json({ success: true, message: 'Thiết lập tài khoản nhân viên thành công', data: await authService.completeStaffSetup(email, otp, password) });
});


export const resendStaffSetup = asyncHandler(async (req, res) => {
  const { email } = resendOtpSchema.parse(req.body);
  await authService.resendStaffSetup(email);
  res.json({ success: true, message: 'Nếu lời mời Staff còn hiệu lực, OTP mới đã được gửi.' });
});
