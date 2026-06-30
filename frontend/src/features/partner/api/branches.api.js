import { apiClient } from "../../../services/apiClient";

export const getPartnerBranches = async () => {
  const response = await apiClient.get("/partner/branches");
  return response.data;
};

export const createPartnerBranch = async (data) => {
  const response = await apiClient.post("/partner/branches", data);
  return response.data;
};

export const updatePartnerBranch = async ({ id, ...data }) => {
  if (!id) throw new Error("Branch ID is required for updatePartnerBranch");
  const response = await apiClient.put(`/partner/branches/${id}`, data);
  return response.data;
};

export const deletePartnerBranch = async (id) => {
  if (!id) throw new Error("Branch ID is required for deletePartnerBranch");
  const response = await apiClient.delete(`/partner/branches/${id}`);
  return response.data;
};
