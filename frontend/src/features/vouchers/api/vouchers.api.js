import {apiClient} from '../../../services/apiClient'

export const getVouchers = async (params = {}) => {
    const response = await apiClient.get("/vouchers", {params});
    return response.data;
}

export const getVoucherById = async (id) => {
    const response = await apiClient.get(`/vouchers/${id}`);
    return response.data;
}

export const getCategories = async () => {
    const response = await apiClient.get("/categories");
    return response.data;
}

const BASE_URL = "/api/partner/vouchers";

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function buildVoucherPayload(formData) {
  return {
    name: formData.name.trim(),
    category: formData.category,
    location: formData.location?.trim() || "",
    imageUrl: formData.imageUrl?.trim() || "",
    originalPrice: Number(formData.originalPrice),
    salePrice: Number(formData.salePrice),
    totalQuantity: Number(formData.totalQuantity),
    startDate: formData.startDate,
    endDate: formData.endDate,
  };
}

export function mapVoucherFormToPayload(formData) {
  return buildVoucherPayload(formData);
}

export async function createVoucherDraft(formData) {
  const payload = buildVoucherPayload(formData);
  const response = await apiClient.post(BASE_URL, payload);
  return unwrapResponse(response);
}

export async function submitVoucherForApproval(voucherId) {
  const response = await apiClient.post(`${BASE_URL}/${voucherId}/submit`);
  return unwrapResponse(response);
}