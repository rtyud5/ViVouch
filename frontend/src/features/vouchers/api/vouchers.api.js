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