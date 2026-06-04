import { apiClient } from "../../../services/apiClient";

export async function login(email, password) {
  const response = await apiClient.post("/auth/login", { email, password });

  return response.data.data;
}

export async function register(data) {
  const response = await apiClient.post("/auth/register", data);

  return response.data.data;
}
