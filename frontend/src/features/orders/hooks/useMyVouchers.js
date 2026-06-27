import { useQuery } from "@tanstack/react-query";
import { getVoucherCodes } from "../api/orders.api";
import { useAuthStore } from "../../../stores/authStore";

export function useMyVouchers(options = {}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const query = useQuery({
    queryKey: ["voucher-codes"],
    queryFn: getVoucherCodes,
    ...options,
    enabled: !!accessToken && (options.enabled ?? true),
  });

  return {
    voucherCodes: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    ...query,
  };
}
