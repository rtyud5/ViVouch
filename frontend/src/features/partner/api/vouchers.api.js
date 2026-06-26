import { apiClient } from '../../../services/apiClient';

// Base URL partner voucher endpoints
const BASE = '/partner/vouchers';

// Bóc data ra khỏi response wrapper { data: ... }
function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response;
}

// Map form fields (từ voucherFormSchema) sang đúng tên field của backend.
export function mapVoucherFormToPayload(formData) {
  return {
    title: formData.name?.trim(),
    categoryId: formData.category,
    imageUrl: formData.imageUrl?.trim() || undefined,
    location: formData.location?.trim() || undefined,
    originalPrice: Number(formData.originalPrice),
    salePrice: Number(formData.salePrice),
    totalQty: Number(formData.totalQuantity),
    saleStart: formData.startDate || undefined,
    saleEnd: formData.endDate || undefined,
  };
}

//  API Functions
// Lấy danh sách voucher của partner đang đăng nhập
export async function getPartnerVouchers(params = {}) {
  const response = await apiClient.get(BASE, { params });
  // Backend trả về trực tiếp { data, pagination } không có wrapper thêm
  return response.data;
}

// Tạo voucher mới ở trạng thái DRAFT.
export async function createVoucherDraft(formData) {
  const payload = mapVoucherFormToPayload(formData);
  const response = await apiClient.post(BASE, payload);
  return unwrap(response);
}

// Gửi voucher (đang ở DRAFT hoặc REJECTED) để kiểm duyệt
export async function submitVoucherForApproval(voucherId) {
  const response = await apiClient.post(`${BASE}/${voucherId}/submit`);
  return unwrap(response);
}

// Cập nhật thông tin voucher (chỉ được khi status là DRAFT hoặc REJECTED)
export async function updateVoucher(voucherId, formData) {
  const payload = mapVoucherFormToPayload(formData);
  const response = await apiClient.put(`${BASE}/${voucherId}`, payload);
  return unwrap(response);
}
