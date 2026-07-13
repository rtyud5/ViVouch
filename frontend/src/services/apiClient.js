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
    const isAccountLocked = error.response?.status === 403
      && error.response?.data?.code === "ACCOUNT_LOCKED";

    if (error.response?.status === 401 || isAccountLocked) {
      useAuthStore.getState().clearAuth();

      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;
        try {
          sessionStorage.setItem(
            "authMessage",
            isAccountLocked
              ? "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên."
              : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          );
        }
        catch (e) {
          console.warn("sessionStorage is not available:", e);
        }
        window.location.assign("/login");
        setTimeout(() => {
          isRedirecting = false;
        }, 5000);
      }
    }

    return Promise.reject(error);
  }
);
