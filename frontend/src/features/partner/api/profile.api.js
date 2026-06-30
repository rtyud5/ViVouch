import { apiClient } from "../../../services/apiClient";

export const getPartnerProfile = async () => {
  const response = await apiClient.get("/api/partner/profile");
  return response.data;
};

export const updatePartnerProfile = async (data) => {
  const response = await apiClient.put("/api/partner/profile", data);
  return response.data;
};
