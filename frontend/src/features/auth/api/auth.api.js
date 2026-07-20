import { apiClient } from "../../../services/apiClient";

export async function login(email, password) {
  const response = await apiClient.post("/auth/login", { email, password });

  return response.data.data;
}

export async function register(data) {
  const response = await apiClient.post("/auth/register", data);

  return response.data.data;
}

export async function logoutSession(refreshToken) {
  const response = await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : {});
  return response.data;
}

export async function requestPasswordReset(email) {
  return (await apiClient.post("/auth/forgot-password", { email })).data;
}

export async function resetPassword(resetToken, password) {
  return (await apiClient.post("/auth/reset-password", { resetToken, password })).data;
}
