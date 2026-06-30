import { apiClient } from "../../../services/apiClient";

export const getPartnerReports = async (range) => {
  const response = await apiClient.get("/partner/reports", {
    params: { range },
  });
  return response.data;
};
