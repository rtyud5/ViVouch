import { apiClient } from "../../../services/apiClient";

const BASE = "/customer/cart";


export async function getCart() {
  const { data } = await apiClient.get(BASE);
  return data.data; 
}

export async function addCartItem({ voucherId, qty }) {
  const { data } = await apiClient.post(`${BASE}/items`, { voucherId, qty });
  return data.data;
}

export async function updateCartItem({ itemId, qty }) {
  const { data } = await apiClient.patch(`${BASE}/items/${itemId}`, { qty });
  return data.data;
}

export async function removeCartItem(itemId) {
  const { data } = await apiClient.delete(`${BASE}/items/${itemId}`);
  return data.data;
}