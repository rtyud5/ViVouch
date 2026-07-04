import { apiClient } from '../../../services/apiClient';

// Lấy danh sách voucher công khai (status = ON_SALE).
export const getVouchers = async (params = {}) => {
  const response = await apiClient.get('/vouchers', { params });
  return response.data;
};

// Lấy chi tiết một voucher theo ID.
export const getVoucherById = async (id) => {
  const response = await apiClient.get(`/vouchers/${id}`);
  return response.data;
};

// Lấy danh sách danh mục voucher.
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

// Lấy danh sách đánh giá của voucher
export const getVoucherReviews = async (voucherId, params = {}) => {
  const response = await apiClient.get(`/vouchers/${voucherId}/reviews`, { params });
  return response.data;
};

// Tạo đánh giá cho voucher
export const createVoucherReview = async (voucherId, data) => {
  const response = await apiClient.post(`/vouchers/${voucherId}/reviews`, data);
  return response.data;
};