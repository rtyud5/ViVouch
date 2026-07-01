import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile, changePassword } from "../services/users.service";
import { useAuthStore } from "../../../stores/authStore";

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    enabled: !!accessToken,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setAuth({ user: updatedUser, accessToken });
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
}
