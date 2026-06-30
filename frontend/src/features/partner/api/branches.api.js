import { apiClient } from "../../../services/apiClient";

export const getPartnerBranches = async () => {
  const response = await apiClient.get("/api/partner/branches");
  return response.data;
};

export const createPartnerBranch = async (data) => {
  const response = await apiClient.post("/api/partner/branches", data);
  return response.data;
};

export const updatePartnerBranch = async ({ id, ...data }) => {
  const response = await apiClient.put(`/api/partner/branches/${id}`, data);
  return response.data;
};

export const deletePartnerBranch = async (id) => {
  const response = await apiClient.delete(`/api/partner/branches/${id}`);
  return response.data;
};
