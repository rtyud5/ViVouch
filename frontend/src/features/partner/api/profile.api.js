import { apiClient } from "../../../services/apiClient";

export const getPartnerProfile = async () => {
  const response = await apiClient.get("/partner/profile");
  return response.data;
};

export const updatePartnerProfile = async (data) => {
  const response = await apiClient.put("/partner/profile", data);
  return response.data;
};
