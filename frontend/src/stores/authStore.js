import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const createAuthState = ({ user = null, accessToken = null } = {}) => ({
  user,
  accessToken,
  isAuthenticated: Boolean(accessToken)
});

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        ...createAuthState(),
        setAuth: ({ user, accessToken }) => set(
          createAuthState({ user, accessToken }),
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
        partialize: ({ user, accessToken }) => ({ user, accessToken }),
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...createAuthState(persistedState || {})
        })
      }
    ),
    { name: "authStore" }
  )
);
