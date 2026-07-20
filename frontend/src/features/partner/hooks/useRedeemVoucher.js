import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkVoucher, redeemVoucher } from "../api/redeem.api";

export const useCheckVoucher = () => useMutation({
  mutationFn: checkVoucher,
});

export const useRedeemVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["partnerReports"] });
      queryClient.invalidateQueries({ queryKey: ["partnerProfile"] });
    },
  });
};
