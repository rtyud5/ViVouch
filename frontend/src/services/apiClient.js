import axios from "axios";
import { useAuthStore } from "../stores/authStore";

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error(
    "[apiClient] VITE_API_BASE_URL is not defined. Check your .env file."
  );
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();

      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;
        sessionStorage.setItem("authMessage", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.assign("/login");
        setTimeout(() => {
          isRedirecting = false;
        }, 5000);
      }
    }

    return Promise.reject(error);
  }
);
