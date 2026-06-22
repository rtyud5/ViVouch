import { apiClient } from '../../../services/apiClient';

/**
 * Admin API layer
 * All endpoints require ADMIN role (handled by apiClient auth interceptor).
 */

/**
 * GET /api/admin/dashboard
 * Returns: { totalUsers, activePartners, revenueThisMonth, ordersToday }
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data.data;
};

// TODO: replace with API GET /api/admin/partners?status=PENDING&limit=3
// export const getRecentPartners = async () => {
//   const response = await apiClient.get('/admin/partners', {
//     params: { status: 'PENDING', limit: 3 },
//   });
//   return response.data.data;
// };

// TODO: replace with API GET /api/admin/orders?limit=5
// export const getRecentOrders = async () => {
//   const response = await apiClient.get('/admin/orders', {
//     params: { limit: 5 },
//   });
//   return response.data.data;
// };

export const getPartners = async (params) => {
  const response = await apiClient.get('/admin/partners', { params });
  return response.data;
};

export const approvePartner = async (partnerId) => {
  const response = await apiClient.post(`/admin/partners/${partnerId}/approve`);
  return response.data;
};

export const rejectPartner = async (partnerId, reason) => {
  const response = await apiClient.post(`/admin/partners/${partnerId}/reject`, { reason });
  return response.data;
};

export const getVouchers = async (params) => {
  const response = await apiClient.get('/admin/vouchers', { params });
  return response.data;
};

export const approveVoucher = async (voucherId) => {
  const response = await apiClient.post(`/admin/vouchers/${voucherId}/approve`);
  return response.data;
};

export const rejectVoucher = async (voucherId, reason) => {
  const response = await apiClient.post(`/admin/vouchers/${voucherId}/reject`, { reason });
  return response.data;
};

export const getUsers = async (params) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

export const toggleUserLock = async (userId) => {
  const response = await apiClient.post(`/admin/users/${userId}/toggle-lock`);
  return response.data;
};

export const getOrders = async (params) => {
  const response = await apiClient.get('/admin/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await apiClient.get(`/admin/orders/${id}`);
  return response.data;
};

export const getAuditLogs = async (params) => {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data;
};
