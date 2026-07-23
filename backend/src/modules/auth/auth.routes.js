import { Router } from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { authRateLimiter, otpRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();
router.post('/register', authRateLimiter, authController.register);
router.post('/partner-register', authRateLimiter, authController.registerPartner);
router.post('/verify-email', otpRateLimiter, authController.verifyEmail);
router.post('/resend-verification', otpRateLimiter, authController.resendVerification);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', otpRateLimiter, authController.forgotPassword);
router.post('/reset-password', otpRateLimiter, authController.resetPassword);
router.post('/staff/setup', otpRateLimiter, authController.completeStaffSetup);
router.post('/staff/resend-setup', otpRateLimiter, authController.resendStaffSetup);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.get('/admin-only', verifyToken, requireRole(ROLES.ADMIN), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});
export default router;
