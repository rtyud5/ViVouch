import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { createSupportReference, getRequestReference } from "../utils/errorReference";

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
let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) throw new Error("Missing refresh token");

    refreshPromise = axios
      .post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken })
      .then((response) => {
        useAuthStore.getState().setAuth(response.data.data);
        return response.data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAccountLocked = error.response?.status === 403
      && error.response?.data?.code === "ACCOUNT_LOCKED";
    const originalRequest = error.config;

    if (
      error.response?.status === 401
      && !originalRequest?._retry
      && useAuthStore.getState().refreshToken
      && !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // Fall through to a clean local logout and redirect.
      }
    }

    if (error.response?.status === 401 || isAccountLocked) {
      useAuthStore.getState().clearAuth();

      if (!isRedirecting && window.location.pathname !== "/login") {
        isRedirecting = true;
        try {
          sessionStorage.setItem(
            "authMessage",
            isAccountLocked
              ? "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
              : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          );
        } catch (e) {
          console.warn("sessionStorage is not available:", e);
        }
        window.location.assign("/login");
        setTimeout(() => {
          isRedirecting = false;
        }, 5000);
      }
    } else if (error.response) {
      if (error.response.status === 429) {
        error.message = "Thao tác quá nhanh (Too Many Requests). Vui lòng thử lại sau.";
      } else if (error.response.status >= 500) {
        const requestReference = getRequestReference(error);
        const supportReference = error.supportReference || createSupportReference(requestReference ? "SRV" : "NET");
        error.requestReference = requestReference || null;
        error.supportReference = supportReference;
        error.message = `Hệ thống gặp sự cố. Vui lòng cung cấp mã ${requestReference || supportReference} cho bộ phận hỗ trợ.`;
      } else if (error.response.status === 409) {
        const msg = error.response.data?.message;
        error.message = (typeof msg === "string" && msg.trim() !== "")
          ? msg
          : "Xung đột dữ liệu (Conflict). Vui lòng tải lại và thử lại.";
      }
    } else {
      const supportReference = error.supportReference || createSupportReference("NET");
      error.requestReference = error.requestReference || null;
      error.supportReference = supportReference;
      error.message = `Không thể kết nối tới mạng hoặc máy chủ. Mã hỗ trợ: ${supportReference}.`;
    }

    return Promise.reject(error);
  }
);
