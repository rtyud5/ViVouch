import { useMutation } from "@tanstack/react-query";
import { redeemVoucher } from "../api/redeem.api";

export const useRedeemVoucher = () => {
  return useMutation({
    mutationFn: redeemVoucher,
  });
};
