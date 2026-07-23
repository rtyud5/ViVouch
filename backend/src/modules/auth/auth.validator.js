import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Email không hợp lệ');
const password = z.string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(72, 'Mật khẩu tối đa 72 ký tự')
  .regex(/[a-z]/, 'Mật khẩu phải có chữ thường')
  .regex(/[A-Z]/, 'Mật khẩu phải có chữ hoa')
  .regex(/\d/, 'Mật khẩu phải có chữ số');
const phone = z.string().trim().min(9).max(15).optional().nullable().transform((value) => value || null);

export const registerSchema = z.object({
  email,
  password,
  fullName: z.string().trim().min(2).max(100),
  phone,
});

export const partnerRegisterSchema = registerSchema.extend({
  businessName: z.string().trim().min(2).max(200),
  taxCode: z.string().trim().min(5).max(30),
  representativeName: z.string().trim().min(2).max(100),
  contactEmail: email.optional(),
  contactPhone: phone,
  address: z.string().trim().min(5).max(500),
  firstBranch: z.object({
    name: z.string().trim().min(2).max(100),
    address: z.string().trim().min(5).max(500),
    city: z.string().trim().min(2).max(100).default('Hồ Chí Minh'),
  }).optional(),
});

export const verifyEmailSchema = z.object({
  email,
  otp: z.string().regex(/^\d{6}$/, 'OTP phải gồm 6 chữ số'),
});

export const resendOtpSchema = z.object({ email });
export const loginSchema = z.object({ email, password: z.string().min(1) });
export const refreshTokenSchema = z.object({ refreshToken: z.string().min(1) });
export const logoutSchema = z.object({ refreshToken: z.string().min(1).optional() });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  email,
  otp: z.string().regex(/^\d{6}$/),
  password,
});
export const staffSetupSchema = resetPasswordSchema;
