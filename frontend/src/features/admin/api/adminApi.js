import { apiClient } from '../../../services/apiClient';

/**
 * Admin API layer
 * All endpoints require ADMIN role (handled by apiClient auth interceptor).
 */

const cleanParams = (params) => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
  );
};

/**
 * GET /api/admin/dashboard
 * Returns: { totalUsers, activePartners, revenueThisMonth, ordersToday }
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data.data;
};


export const getPartners = async (params) => {
  const response = await apiClient.get('/admin/partners', { params: cleanParams(params) });
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

export const setPartnerStatus = async (partnerId, status, reason) => {
  const response = await apiClient.patch(`/admin/partners/${partnerId}/status`, { status, reason });
  return response.data;
};

export const getVouchers = async (params) => {
  const response = await apiClient.get('/admin/vouchers', { params: cleanParams(params) });
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
  const response = await apiClient.get('/admin/users', { params: cleanParams(params) });
  return response.data;
};

export const toggleUserLock = async (userId) => {
  const response = await apiClient.post(`/admin/users/${userId}/toggle-lock`);
  return response.data;
};

export const assignUserRole = async (userId, role) => {
  const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const getOrders = async (params) => {
  const response = await apiClient.get('/admin/orders', { params: cleanParams(params) });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await apiClient.get(`/admin/orders/${id}`);
  return response.data;
};

export const cancelOrder = async (id, reason) => {
  const response = await apiClient.post(`/admin/orders/${id}/cancel`, { reason });
  return response.data;
};

export const getAuditLogs = async (params) => {
  const response = await apiClient.get('/admin/audit-logs', { params: cleanParams(params) });
  return response.data;
};

export const getContent = async (type) => (await apiClient.get(`/admin/content/${type}`)).data.data;
export const createContent = async (type, data) => (await apiClient.post(`/admin/content/${type}`, data)).data.data;
export const updateContent = async (type, id, data) => (await apiClient.patch(`/admin/content/${type}/${id}`, data)).data.data;
export const deleteContent = async (type, id) => apiClient.delete(`/admin/content/${type}/${id}`);
