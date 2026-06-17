import { apiClient } from "../../../services/apiClient";

const BASE = "/customer/orders";

export async function checkout(items, paymentMethod) {
  const payload = { items };

  if (paymentMethod) {
    payload.paymentMethod = paymentMethod;
  }

  const { data } = await apiClient.post(`${BASE}/cart/checkout`, payload);
  return data.data;
}

export async function getOrders() {
  const { data } = await apiClient.get(BASE);
  return data.data;
}

export async function getVoucherCodes() {
  const { data } = await apiClient.get(`${BASE}/voucher-codes`);
  return data.data;
}
