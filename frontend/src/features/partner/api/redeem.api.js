import { apiClient } from "../../../services/apiClient";

export const checkVoucher = async (data) => {
  const response = await apiClient.post("/partner/redeem/check", data);
  return response.data.data;
};

export const redeemVoucher = async (data) => {
  const response = await apiClient.post("/partner/redeem/confirm", data);
  return response.data.data;
};
