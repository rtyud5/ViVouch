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
