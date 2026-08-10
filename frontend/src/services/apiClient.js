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
              ? "TÃ i khoáº£n Ä‘Ã£ bá»‹ khoÃ¡. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn."
              : "PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.",
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
    } else if (error.response) {
      if (error.response.status === 429) {
        error.message = "Thao tÃ¡c quÃ¡ nhanh (Too Many Requests). Vui lÃ²ng thá»­ láº¡i sau.";
      } else if (error.response.status >= 500) {
        const reqId = getRequestReference(error) || createSupportReference("SRV");
        error.requestReference = reqId;
        error.message = `Há»‡ thá»‘ng gáº·p sá»± cá»‘. Vui lÃ²ng cung cáº¥p mÃ£ ${reqId} cho bá»™ pháº­n há»— trá»£.`;
      } else if (error.response.status === 409) {
        const msg = error.response.data?.message;
        error.message = (typeof msg === 'string' && msg.trim() !== '')
          ? msg
          : "Xung Ä‘á»™t dá»¯ liá»‡u (Conflict). Vui lÃ²ng táº£i láº¡i vÃ  thá»­ láº¡i.";
      }
    } else {
      const reqId = createSupportReference("NET");
      error.requestReference = reqId;
      error.message = `KhÃ´ng thá»ƒ káº¿t ná»‘i tá»›i máº¡ng hoáº·c mÃ¡y chá»§. MÃ£ há»— trá»£: ${reqId}.`;
    }

    return Promise.reject(error);
  }
);
