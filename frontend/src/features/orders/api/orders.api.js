import { apiClient } from '../../../services/apiClient';
const BASE = '/customer/orders';

export async function checkout(items, paymentMethod, recipientName, recipientPhone, note, idempotencyKey) {
  const payload = { items, paymentMethod, recipientName, recipientPhone, note };
  const { data } = await apiClient.post(`${BASE}/cart/checkout`, payload, { headers: { 'Idempotency-Key': idempotencyKey } });
  return data.data;
}
export async function getOrders() { 
  return (await apiClient.get(BASE)).data.data; 
}
export async function getVoucherCodes() { return (await apiClient.get(`${BASE}/voucher-codes`)).data.data; }
export async function getPaymentStatus(orderId) { return (await apiClient.get(`/payments/${orderId}/status`)).data.data; }
export async function cancelOrder(orderId) { return (await apiClient.post(`${BASE}/${orderId}/cancel`)).data; }
export async function mockPayOrder(orderId) { return (await apiClient.post(`${BASE}/${orderId}/mock-pay`)).data; }
export async function syncPayosOrder(orderId) { return (await apiClient.post(`${BASE}/${orderId}/sync-payos`)).data; }
