import { useQuery } from "@tanstack/react-query";
import { getVoucherCodes } from "../api/orders.api";

export function useMyVouchers(options = {}) {
  const query = useQuery({
    queryKey: ["voucher-codes"],
    queryFn: getVoucherCodes,
    ...options,
  });

  return {
    voucherCodes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  };
}
