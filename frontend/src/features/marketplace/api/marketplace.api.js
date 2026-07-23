import { apiClient } from '../../../services/apiClient';

export async function getNotifications(page = 1, limit = 20) {
  return (await apiClient.get('/notifications', { params: { page, limit } })).data.data;
}

export async function markNotificationRead(id) {
  return (await apiClient.patch(`/notifications/${id}/read`)).data;
}

export async function markAllNotificationsRead() {
  return (await apiClient.patch('/notifications/read-all')).data;
}

export async function listStaff() {
  return (await apiClient.get('/partner/staff')).data.data;
}

export async function createStaff(payload) {
  return (await apiClient.post('/partner/staff', payload)).data.data;
}

export async function updateStaff(id, payload) {
  return (await apiClient.patch(`/partner/staff/${id}`, payload)).data.data;
}

export async function getStaffRedeemHistory() {
  return (await apiClient.get('/partner/staff/me/redeem-history')).data.data;
}

export async function listMyRefunds() {
  return (await apiClient.get('/customer/refunds')).data.data;
}

export async function requestRefund(payload) {
  return (await apiClient.post('/customer/refunds', payload)).data.data;
}

export async function listAdminRefunds(params = {}) {
  return (await apiClient.get('/admin/refunds', { params })).data.data;
}

export async function approveRefund(id, adminNote) {
  return (await apiClient.post(`/admin/refunds/${id}/approve`, { adminNote })).data.data;
}

export async function rejectRefund(id, adminNote) {
  return (await apiClient.post(`/admin/refunds/${id}/reject`, { adminNote })).data.data;
}

export async function completeManualRefund(id, adminNote, providerRefundReference) {
  return (await apiClient.post(`/admin/refunds/${id}/complete`, { adminNote, providerRefundReference })).data.data;
}

export async function listMyTickets() {
  return (await apiClient.get('/customer/tickets')).data.data;
}

export async function createTicket(payload) {
  return (await apiClient.post('/customer/tickets', payload)).data.data;
}

export async function listAdminTickets(params = {}) {
  return (await apiClient.get('/admin/tickets', { params })).data.data;
}

export async function respondTicket(id, payload) {
  return (await apiClient.post(`/admin/tickets/${id}/respond`, payload)).data.data;
}
