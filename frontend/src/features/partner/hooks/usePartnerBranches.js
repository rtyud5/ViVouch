import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPartnerBranches,
  createPartnerBranch,
  updatePartnerBranch,
  deletePartnerBranch,
} from "../api/branches.api";

export const PARTNER_BRANCHES_QUERY_KEY = ["partnerBranches"];

export const usePartnerBranches = () => {
  return useQuery({
    queryKey: PARTNER_BRANCHES_QUERY_KEY,
    queryFn: getPartnerBranches,
  });
};

export const useCreatePartnerBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPartnerBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_BRANCHES_QUERY_KEY });
    },
  });
};

export const useUpdatePartnerBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePartnerBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_BRANCHES_QUERY_KEY });
    },
  });
};

export const useDeletePartnerBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePartnerBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNER_BRANCHES_QUERY_KEY });
    },
  });
};
