import { apiClient } from "../../../services/apiClient";

export async function getMe() {
  const response = await apiClient.get("/users/me");
  return response.data.data;
}

export async function updateProfile(data) {
  const response = await apiClient.put("/users/me", data);
  return response.data.data;
}

export async function changePassword(data) {
  const response = await apiClient.post("/users/me/change-password", data);
  return response.data.data;
}
