import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPartnerProfile, updatePartnerProfile } from "../api/profile.api";

export const PARTNER_PROFILE_QUERY_KEY = ["partnerProfile"];

export const usePartnerProfile = () => {
  return useQuery({
    queryKey: PARTNER_PROFILE_QUERY_KEY,
    queryFn: getPartnerProfile,
  });
};

export const useUpdatePartnerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePartnerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_PROFILE_QUERY_KEY });
    },
  });
};
