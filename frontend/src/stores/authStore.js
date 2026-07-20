import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const createAuthState = ({ user = null, accessToken = null, refreshToken = null } = {}) => ({
  user,
  accessToken,
  refreshToken,
  isAuthenticated: Boolean(accessToken)
});

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        ...createAuthState(),
        setAuth: ({ user, accessToken, refreshToken }) => set(
          createAuthState({ user, accessToken, refreshToken }),
          false,
          "auth/setAuth"
        ),
        clearAuth: () => {
          useAuthStore.persist.clearStorage();
          set(createAuthState(), false, "auth/clearAuth");
        }
      }),
      {
        name: "vivouch-auth",
        partialize: ({ user, accessToken, refreshToken }) => ({ user, accessToken, refreshToken }),
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...createAuthState(persistedState || {})
        })
      }
    ),
    { name: "authStore" }
  )
);
