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