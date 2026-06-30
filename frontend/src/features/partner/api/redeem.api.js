import { apiClient } from "../../../services/apiClient";

export const redeemVoucher = async (data) => {
  const response = await apiClient.post("/api/partner/redeem", data);
  return response.data;
};
