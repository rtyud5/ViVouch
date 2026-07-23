import { apiClient } from '../../../services/apiClient';

export async function login(email, password) {
  return (await apiClient.post('/auth/login', { email, password })).data.data;
}
export async function register(data) {
  return (await apiClient.post('/auth/register', data)).data.data;
}
export async function registerPartner(data) {
  return (await apiClient.post('/auth/partner-register', data)).data.data;
}
export async function verifyEmail(email, otp) {
  return (await apiClient.post('/auth/verify-email', { email, otp })).data;
}
export async function resendVerification(email) {
  return (await apiClient.post('/auth/resend-verification', { email })).data;
}
export async function logoutSession(refreshToken) {
  return (await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {})).data;
}
export async function requestPasswordReset(email) {
  return (await apiClient.post('/auth/forgot-password', { email })).data;
}
export async function resetPassword(email, otp, password) {
  return (await apiClient.post('/auth/reset-password', { email, otp, password })).data;
}
export async function completeStaffSetup(email, otp, password) {
  return (await apiClient.post('/auth/staff/setup', { email, otp, password })).data;
}
export async function getMe() {
  return (await apiClient.get('/auth/me')).data.data;
}

export async function resendStaffSetup(email) {
  return (await apiClient.post('/auth/staff/resend-setup', { email })).data;
}
